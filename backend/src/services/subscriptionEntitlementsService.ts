import type { StripeBrand } from "../config/stripeProducts";
import { resolveBrand } from "../lib/subscriptionBrand";
import { Subscription, type ISubscription } from "../models/Subscription";
import {
  User,
  type BrandSubscriptionSnapshot,
  type IUser,
  type PlanName,
  type SubscriptionStatus,
} from "../models/User";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "trialing"];

export type BrandEntitlement = {
  brand: StripeBrand;
  active: boolean;
  planName: PlanName;
  subscriptionStatus: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  priceId: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

export type MemberEntitlements = {
  smartedge: BrandEntitlement[] | null;
  jonah: BrandEntitlement[] | null;
};

function mapStripeStatusToMember(status: string): SubscriptionStatus {
  const allowed: SubscriptionStatus[] = [
    "active",
    "inactive",
    "trialing",
    "past_due",
    "canceled",
    "unpaid",
  ];
  return allowed.includes(status as SubscriptionStatus)
    ? (status as SubscriptionStatus)
    : status === "active" || status === "trialing"
      ? (status as SubscriptionStatus)
      : "inactive";
}

function isEntitlementActive(status: SubscriptionStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

function docToEntitlement(doc: ISubscription): BrandEntitlement {
  const subscriptionStatus = mapStripeStatusToMember(doc.status);
  return {
    brand: doc.brand,
    active: isEntitlementActive(subscriptionStatus),
    planName: doc.planName as PlanName,
    subscriptionStatus,
    stripeSubscriptionId: doc.stripeSubscriptionId,
    priceId: doc.priceId,
    currentPeriodEnd: doc.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: Boolean(doc.cancelAtPeriodEnd),
  };
}

export async function getSubscriptionsForUser(userId: string): Promise<ISubscription[]> {
  return Subscription.find({ userId }).lean();
}

function pickBetterEntitlement(
  current: BrandEntitlement | null,
  next: BrandEntitlement
): BrandEntitlement {
  if (!current) return next;
  // Prefer active subscriptions
  if (next.active && !current.active) return next;
  if (current.active && !next.active) return current;
  // If both active/inactive, prefer premium plans
  const planHierarchy = { "smartedgeVIPPremium": 3, "jonah-vip-premium": 3, "smartedgeVIP": 2, "jonahvip": 2, "free": 1 };
  const nextTier = planHierarchy[next.planName as keyof typeof planHierarchy] || 0;
  const currentTier = planHierarchy[current.planName as keyof typeof planHierarchy] || 0;
  return nextTier >= currentTier ? next : current;
}

export async function getMemberEntitlements(userId: string): Promise<MemberEntitlements> {
  // Use user's brandSubscriptions as the source of truth (more reliable than Subscription collection)
  const user = await User.findById(userId).lean();
  const smartedgeList: BrandEntitlement[] = [];
  const jonahList: BrandEntitlement[] = [];

  if (user) {
    // For smartedge, use brandSubscriptions
    if (user.brandSubscriptions?.smartedge) {
      const smartedgeSubs = Array.isArray(user.brandSubscriptions.smartedge)
        ? user.brandSubscriptions.smartedge
        : [user.brandSubscriptions.smartedge];
      for (const sub of smartedgeSubs) {
        if (sub && sub.subscriptionStatus === "active") {
          const ent: BrandEntitlement = {
            brand: "smartedge",
            active: true,
            planName: (sub.planName as PlanName) || "free",
            subscriptionStatus: sub.subscriptionStatus as SubscriptionStatus,
            stripeSubscriptionId: sub.stripeSubscriptionId || null,
            priceId: sub.priceId || null,
            currentPeriodEnd: sub.currentPeriodEnd ?? null,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
          };
          smartedgeList.push(ent);
        }
      }
    }
    // For jonah, use brandSubscriptions
    if (user.brandSubscriptions?.jonah) {
      const jonahSubs = Array.isArray(user.brandSubscriptions.jonah)
        ? user.brandSubscriptions.jonah
        : [user.brandSubscriptions.jonah];
      for (const sub of jonahSubs) {
        if (sub && sub.subscriptionStatus === "active") {
          const ent: BrandEntitlement = {
            brand: "jonah",
            active: true,
            planName: (sub.planName as PlanName) || "free",
            subscriptionStatus: sub.subscriptionStatus as SubscriptionStatus,
            stripeSubscriptionId: sub.stripeSubscriptionId || null,
            priceId: sub.priceId || null,
            currentPeriodEnd: sub.currentPeriodEnd ?? null,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
          };
          jonahList.push(ent);
        }
      }
    }
  }

  return {
    smartedge: smartedgeList.length > 0 ? smartedgeList : null,
    jonah: jonahList.length > 0 ? jonahList : null,
  };
}

export function hasSmartedgeEntitlement(entitlements: MemberEntitlements): boolean {
  return Array.isArray(entitlements.smartedge) && entitlements.smartedge.some(e => e.active);
}

export function hasJonahEntitlement(entitlements: MemberEntitlements): boolean {
  return Array.isArray(entitlements.jonah) && entitlements.jonah.some(e => e.active);
}

function entitlementToSnapshot(ent: BrandEntitlement | null): BrandSubscriptionSnapshot | null {
  if (!ent) return null;
  return {
    stripeSubscriptionId: ent.stripeSubscriptionId,
    planName: ent.planName,
    priceId: ent.priceId,
    subscriptionStatus: ent.subscriptionStatus,
    currentPeriodEnd: ent.currentPeriodEnd,
    cancelAtPeriodEnd: ent.cancelAtPeriodEnd,
  };
}

/** Sync `users.brandSubscriptions` from `subscriptions` collection rows. */
export async function refreshUserSubscriptionSummary(userId: string): Promise<IUser | null> {
  // Get all subscriptions from the database for this user (active and canceled)
  const allSubscriptions = await Subscription.find({ userId }).lean();

  // Build brand subscription arrays with all subscriptions (active and canceled)
  const smartedgeSnapshots = allSubscriptions
    .filter((sub) => sub.brand === "smartedge")
    .map((sub) => ({
      stripeSubscriptionId: sub.stripeSubscriptionId,
      planName: sub.planName,
      priceId: sub.priceId,
      subscriptionStatus: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    }));

  const jonahSnapshots = allSubscriptions
    .filter((sub) => sub.brand === "jonah")
    .map((sub) => ({
      stripeSubscriptionId: sub.stripeSubscriptionId,
      planName: sub.planName,
      priceId: sub.priceId,
      subscriptionStatus: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    }));

  return User.findByIdAndUpdate(
    userId,
    {
      brandSubscriptions: {
        smartedge: smartedgeSnapshots,
        jonah: jonahSnapshots,
      },
    },
    { returnDocument: "after" }
  );
}

export async function markBrandSubscriptionCanceled(
  stripeSubscriptionId: string
): Promise<{ user: IUser | null; brand: StripeBrand | null }> {
  const record = await Subscription.findOne({ stripeSubscriptionId });
  if (!record) return { user: null, brand: null };

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId },
    {
      status: "canceled",
      cancelAtPeriodEnd: false,
      canceledAt: new Date(),
    }
  );

  const user = await refreshUserSubscriptionSummary(String(record.userId));
  return { user, brand: record.brand };
}
