import type {
  BrandSubscriptionSnapshot,
  IUser,
  SubscriptionStatus,
  UserBrandSubscriptions,
} from "../models/User";

export const EMPTY_BRAND_SUBSCRIPTIONS: UserBrandSubscriptions = {
  smartedge: null,
  jonah: null,
};

export function normalizeBrandSubscriptions(
  raw?: UserBrandSubscriptions | null
): UserBrandSubscriptions {
  return {
    smartedge: raw?.smartedge ?? null,
    jonah: raw?.jonah ?? null,
  };
}

const ACTIVE: SubscriptionStatus[] = ["active", "trialing"];

export function isBrandSnapshotActive(snap: BrandSubscriptionSnapshot | null | undefined): boolean {
  return Boolean(snap && ACTIVE.includes(snap.subscriptionStatus));
}

/** Any brand active (for coarse access checks). */
export function userHasAnyActiveSubscription(user: Pick<IUser, "brandSubscriptions">): boolean {
  const bs = normalizeBrandSubscriptions(user.brandSubscriptions);
  return isBrandSnapshotActive(bs.smartedge) || isBrandSnapshotActive(bs.jonah);
}

export function aggregateUserSubscriptionStatus(
  bs: UserBrandSubscriptions
): SubscriptionStatus {
  if (isBrandSnapshotActive(bs.smartedge)) return bs.smartedge!.subscriptionStatus;
  if (isBrandSnapshotActive(bs.jonah)) return bs.jonah!.subscriptionStatus;
  const smart = bs.smartedge?.subscriptionStatus;
  const jon = bs.jonah?.subscriptionStatus;
  if (smart && smart !== "inactive") return smart;
  if (jon && jon !== "inactive") return jon;
  return "inactive";
}
