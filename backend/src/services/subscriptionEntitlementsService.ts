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
  smartedge: BrandEntitlement | null;
  jonah: BrandEntitlement | null;
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
  if (next.active && !current.active) return next;
  if (current.active && !next.active) return current;
  return next;
}

export async function getMemberEntitlements(userId: string): Promise<MemberEntitlements> {
  const docs = await getSubscriptionsForUser(userId);
  let smartedge: BrandEntitlement | null = null;
  let jonah: BrandEntitlement | null = null;

  for (const doc of docs) {
    const brand = doc.brand ?? resolveBrand(doc.planName as PlanName);
    const ent = docToEntitlement({ ...doc, brand } as unknown as ISubscription);
    if (brand === "jonah") jonah = pickBetterEntitlement(jonah, ent);
    else smartedge = pickBetterEntitlement(smartedge, ent);
  }

  return { smartedge, jonah };
}

export function hasSmartedgeEntitlement(entitlements: MemberEntitlements): boolean {
  return Boolean(entitlements.smartedge?.active);
}

export function hasJonahEntitlement(entitlements: MemberEntitlements): boolean {
  return Boolean(entitlements.jonah?.active);
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
  const entitlements = await getMemberEntitlements(userId);

  return User.findByIdAndUpdate(
    userId,
    {
      brandSubscriptions: {
        smartedge: entitlementToSnapshot(entitlements.smartedge),
        jonah: entitlementToSnapshot(entitlements.jonah),
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
