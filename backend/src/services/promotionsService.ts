import mongoose from "mongoose";
import { stripe } from "../lib/stripe";
import { Promotion, type IPromotion, type PromotionStatus } from "../models/Promotion";
import { User } from "../models/User";

export type PromotionListStatus = "active" | "inactive" | "expired";

export type PromotionRow = {
  id: string;
  code: string;
  description: string;
  discount: string;
  discountPercent: number;
  redemptions: number;
  maxRedemptions: number | null;
  expires: string;
  expiresAt: string | null;
  status: PromotionListStatus;
  stripePromotionCodeId: string;
  assignedUserIds: string[];
  assignedUsers: Array<{ _id: string; email: string; name: string }>;
};

export type CreatePromotionInput = {
  code: string;
  description: string;
  discountPercent: number;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  status?: PromotionStatus;
  assignedUserIds?: string[];
  createdBy: string;
};

export type UpdatePromotionInput = {
  description?: string;
  status?: PromotionStatus;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  assignedUserIds?: string[];
};

function parseExpiresAt(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid expiry date");
  }
  return d;
}

function formatExpires(promo: IPromotion): string {
  if (!promo.expiresAt) return "—";
  return promo.expiresAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

function resolveListStatus(promo: IPromotion): PromotionListStatus {
  if (promo.status === "inactive") return "inactive";
  if (promo.expiresAt && promo.expiresAt.getTime() < Date.now()) return "expired";
  return "active";
}

async function fetchStripeRedemptions(stripePromotionCodeId: string): Promise<number> {
  try {
    const promo = await stripe.promotionCodes.retrieve(stripePromotionCodeId);
    return promo.times_redeemed ?? 0;
  } catch {
    return 0;
  }
}

async function loadAssignedUsers(
  ids: mongoose.Types.ObjectId[]
): Promise<Array<{ _id: string; email: string; name: string }>> {
  if (ids.length === 0) return [];
  const users = await User.find({ _id: { $in: ids } })
    .select("email name")
    .lean();
  return users.map((u) => ({
    _id: u._id.toString(),
    email: u.email,
    name: u.name,
  }));
}

async function toPromotionRow(promo: IPromotion): Promise<PromotionRow> {
  const redemptions = await fetchStripeRedemptions(promo.stripePromotionCodeId);
  const assignedUsers = await loadAssignedUsers(promo.assignedUserIds);
  return {
    id: promo._id.toString(),
    code: promo.code,
    description: promo.description,
    discount: `${promo.discountPercent}% off`,
    discountPercent: promo.discountPercent,
    redemptions,
    maxRedemptions: promo.maxRedemptions,
    expires: formatExpires(promo),
    expiresAt: promo.expiresAt?.toISOString() ?? null,
    status: resolveListStatus(promo),
    stripePromotionCodeId: promo.stripePromotionCodeId,
    assignedUserIds: promo.assignedUserIds.map((id) => id.toString()),
    assignedUsers,
  };
}

function normalizeCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9_-]{3,40}$/.test(normalized)) {
    throw new Error("Code must be 3–40 characters (letters, numbers, _ or -)");
  }
  return normalized;
}

async function validateAssignedUserIds(userIds: string[] | undefined): Promise<mongoose.Types.ObjectId[]> {
  if (!userIds?.length) return [];
  const unique = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
  const objectIds = unique.map((id) => {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error(`Invalid user id: ${id}`);
    }
    return new mongoose.Types.ObjectId(id);
  });
  const found = await User.countDocuments({ _id: { $in: objectIds } });
  if (found !== objectIds.length) {
    throw new Error("One or more selected users were not found");
  }
  return objectIds;
}

export const promotionsService = {
  async findAll(): Promise<PromotionRow[]> {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    return Promise.all(promos.map((p) => toPromotionRow(p)));
  },

  async findById(id: string): Promise<PromotionRow> {
    if (!mongoose.isValidObjectId(id)) throw new Error("Invalid promotion id");
    const promo = await Promotion.findById(id);
    if (!promo) throw new Error("Promotion not found");
    return toPromotionRow(promo);
  },

  async create(input: CreatePromotionInput): Promise<PromotionRow> {
    const code = normalizeCode(input.code);
    const existing = await Promotion.findOne({ code });
    if (existing) throw new Error("A promotion with this code already exists");

    const expiresAt = parseExpiresAt(input.expiresAt ?? null);
    if (expiresAt && expiresAt.getTime() <= Date.now()) {
      throw new Error("Expiry date must be in the future");
    }

    const assignedUserIds = await validateAssignedUserIds(input.assignedUserIds);
    const status: PromotionStatus = input.status ?? "active";
    const maxRedemptions =
      input.maxRedemptions != null && input.maxRedemptions > 0
        ? Math.floor(input.maxRedemptions)
        : null;

    const coupon = await stripe.coupons.create({
      percent_off: input.discountPercent,
      duration: "once",
      name: input.description.slice(0, 40),
      ...(maxRedemptions != null ? { max_redemptions: maxRedemptions } : {}),
      ...(expiresAt
        ? { redeem_by: Math.floor(expiresAt.getTime() / 1000) }
        : {}),
    });

    let promotionCode;
    try {
      promotionCode = await stripe.promotionCodes.create({
        promotion: { type: "coupon", coupon: coupon.id },
        code,
        active: status === "active",
        ...(maxRedemptions != null ? { max_redemptions: maxRedemptions } : {}),
        ...(expiresAt
          ? { expires_at: Math.floor(expiresAt.getTime() / 1000) }
          : {}),
      });
    } catch (err) {
      await stripe.coupons.del(coupon.id).catch(() => undefined);
      throw err;
    }

    const promo = await Promotion.create({
      stripeCouponId: coupon.id,
      stripePromotionCodeId: promotionCode.id,
      code,
      description: input.description.trim(),
      discountPercent: input.discountPercent,
      maxRedemptions,
      expiresAt,
      status,
      assignedUserIds,
      createdBy: new mongoose.Types.ObjectId(input.createdBy),
    });

    return toPromotionRow(promo);
  },

  async updateById(id: string, input: UpdatePromotionInput): Promise<PromotionRow> {
    if (!mongoose.isValidObjectId(id)) throw new Error("Invalid promotion id");
    const promo = await Promotion.findById(id);
    if (!promo) throw new Error("Promotion not found");

    if (input.description !== undefined) {
      promo.description = input.description.trim();
    }

    if (input.assignedUserIds !== undefined) {
      promo.assignedUserIds = await validateAssignedUserIds(input.assignedUserIds);
    }

    if (input.status !== undefined) {
      promo.status = input.status;
      await stripe.promotionCodes.update(promo.stripePromotionCodeId, {
        active: input.status === "active",
      });
    }

    if (input.maxRedemptions !== undefined || input.expiresAt !== undefined) {
      throw new Error(
        "Redemption limits and expiry cannot be changed after creation. Create a new promotion instead."
      );
    }

    await promo.save();
    return toPromotionRow(promo);
  },

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    if (!mongoose.isValidObjectId(id)) throw new Error("Invalid promotion id");
    const promo = await Promotion.findById(id);
    if (!promo) throw new Error("Promotion not found");

    await stripe.promotionCodes.update(promo.stripePromotionCodeId, { active: false });
    await Promotion.deleteOne({ _id: promo._id });
    return { deleted: true };
  },

  /**
   * Resolve a customer-facing code for checkout. Returns Stripe promotion code id.
   */
  async resolvePromotionForCheckout(
    userId: string,
    code: string
  ): Promise<{ stripePromotionCodeId: string; promotionId: string }> {
    const normalized = normalizeCode(code);
    const promo = await Promotion.findOne({ code: normalized });
    if (!promo) throw new Error("Invalid or expired promotion code");

    if (promo.status !== "active") {
      throw new Error("This promotion code is not active");
    }

    if (promo.expiresAt && promo.expiresAt.getTime() < Date.now()) {
      throw new Error("This promotion code has expired");
    }

    if (promo.assignedUserIds.length > 0) {
      const allowed = promo.assignedUserIds.some((id) => id.toString() === userId);
      if (!allowed) {
        throw new Error("This promotion code is not available for your account");
      }
    }

    const stripePromo = await stripe.promotionCodes.retrieve(promo.stripePromotionCodeId);
    if (!stripePromo.active) {
      throw new Error("This promotion code is not active");
    }

    if (
      stripePromo.max_redemptions != null &&
      (stripePromo.times_redeemed ?? 0) >= stripePromo.max_redemptions
    ) {
      throw new Error("This promotion code has reached its redemption limit");
    }

    return {
      stripePromotionCodeId: promo.stripePromotionCodeId,
      promotionId: promo._id.toString(),
    };
  },

  async listForUser(userId: string): Promise<PromotionRow[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const promos = await Promotion.find({
      status: "active",
      $or: [
        { assignedUserIds: userObjectId },
        { assignedUserIds: { $size: 0 } },
      ],
      $and: [
        {
          $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
        },
      ],
    }).sort({ createdAt: -1 });

    const rows: PromotionRow[] = [];
    for (const promo of promos) {
      if (promo.assignedUserIds.length === 0) continue;
      rows.push(await toPromotionRow(promo));
    }
    return rows;
  },
};
