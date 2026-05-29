import { JonahSubscriber } from "../models/JonahSubscriber";
import { JonahSyncMeta } from "../models/JonahSyncMeta";

function subscriberToApiUser(doc: {
  userId: { toString(): string };
  email: string;
  name: string;
  image?: string;
  stripeCustomerId?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  state?: string | null;
  zip?: string | null;
  phoneNumber?: string | null;
  wpRole?: string | null;
  subscriptionId?: string | null;
  subscriptionStatus: string;
  currentPlan: string;
  priceId?: string | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
  userCreatedAt: Date;
  userUpdatedAt: Date;
  jonahProductId: string;
  jonahProductName: string;
}) {
  return {
    _id: doc.userId.toString(),
    email: doc.email,
    name: doc.name,
    image: doc.image,
    stripeCustomerId: doc.stripeCustomerId,
    city: doc.city,
    country: doc.country,
    address: doc.address,
    state: doc.state,
    zip: doc.zip,
    phoneNumber: doc.phoneNumber,
    wpRole: doc.wpRole,
    subscriptionId: doc.subscriptionId,
    subscriptionStatus: doc.subscriptionStatus,
    currentPlan: doc.currentPlan,
    priceId: doc.priceId,
    currentPeriodEnd: doc.currentPeriodEnd,
    cancelAtPeriodEnd: doc.cancelAtPeriodEnd,
    createdAt: doc.userCreatedAt,
    updatedAt: doc.userUpdatedAt,
    jonahProductId: doc.jonahProductId,
    jonahProductName: doc.jonahProductName,
  };
}

async function loadCatalogMeta() {
  const meta = await JonahSyncMeta.findOne({ key: "catalog" }).lean();
  return {
    products: meta?.products ?? [],
    priceIds: meta?.priceIds ?? [],
    lastSyncedAt: meta?.syncedAt ?? null,
  };
}

export const jonahUsersService = {
  /** Reads from `JonahSubscriber` only (no Stripe). Run `npm run sync:jonah-users` to refresh. */
  async findSubscribers(options: {
    page: number;
    limit: number;
    search?: string;
    status?: string[];
    joinedFrom?: Date;
    joinedTo?: Date;
  }) {
    const { page, limit, search, status, joinedFrom, joinedTo } = options;
    const { products, priceIds, lastSyncedAt } = await loadCatalogMeta();

    const filter: Record<string, unknown> = {};
    const trimmed = search?.trim();
    if (trimmed) {
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.email = { $regex: escaped, $options: "i" };
    }
    if (status && status.length > 0) {
      filter.subscriptionStatus = { $in: status };
    }
    if (joinedFrom || joinedTo) {
      const range: Record<string, Date> = {};
      if (joinedFrom) range.$gte = joinedFrom;
      if (joinedTo) range.$lte = joinedTo;
      filter.userCreatedAt = range;
    }

    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      JonahSubscriber.find(filter)
        .sort({ userCreatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JonahSubscriber.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products,
      priceIds,
      lastSyncedAt,
      users: rows.map(subscriberToApiUser),
      page,
      limit,
      total,
      totalPages,
    };
  },
};
