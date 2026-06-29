import type {
  BrandSubscriptionSnapshot,
  IUser,
  SubscriptionStatus,
  UserBrandSubscriptions,
} from "../models/User";

export const EMPTY_BRAND_SUBSCRIPTIONS: UserBrandSubscriptions = {
  smartedge: [],
  jonah: [],
};

export function normalizeBrandSubscriptions(
  raw?: UserBrandSubscriptions | null
): UserBrandSubscriptions {
  return {
    smartedge: Array.isArray(raw?.smartedge) ? raw.smartedge : [],
    jonah: Array.isArray(raw?.jonah) ? raw.jonah : [],
  };
}

const ACTIVE: SubscriptionStatus[] = ["active", "trialing"];

export function isBrandSnapshotActive(snap: BrandSubscriptionSnapshot | BrandSubscriptionSnapshot[] | null | undefined): boolean {
  if (!snap) return false;

  if (Array.isArray(snap)) {
    return snap.some((s) => ACTIVE.includes(s.subscriptionStatus));
  }

  return ACTIVE.includes(snap.subscriptionStatus);
}

/** Any brand active (for coarse access checks). */
export function userHasAnyActiveSubscription(user: Pick<IUser, "brandSubscriptions">): boolean {
  const bs = normalizeBrandSubscriptions(user.brandSubscriptions);
  return isBrandSnapshotActive(bs.smartedge) || isBrandSnapshotActive(bs.jonah);
}

export function aggregateUserSubscriptionStatus(
  bs: UserBrandSubscriptions
): SubscriptionStatus {
  // Get first active subscription from smartedge or jonah
  if (Array.isArray(bs.smartedge)) {
    const active = bs.smartedge.find((s) => ACTIVE.includes(s.subscriptionStatus));
    if (active) return active.subscriptionStatus;
  }

  if (Array.isArray(bs.jonah)) {
    const active = bs.jonah.find((s) => ACTIVE.includes(s.subscriptionStatus));
    if (active) return active.subscriptionStatus;
  }

  // Fallback to first non-inactive status
  if (Array.isArray(bs.smartedge) && bs.smartedge.length > 0) {
    const status = bs.smartedge[0].subscriptionStatus;
    if (status !== "inactive") return status;
  }

  if (Array.isArray(bs.jonah) && bs.jonah.length > 0) {
    const status = bs.jonah[0].subscriptionStatus;
    if (status !== "inactive") return status;
  }

  return "inactive";
}
