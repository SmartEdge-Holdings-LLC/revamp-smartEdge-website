import type { UserBrandSubscriptions } from "@/types/brand-subscriptions";
import type { PlanName, SubscriptionStatus } from "@/types";

const ACTIVE: SubscriptionStatus[] = ["active", "trialing"];

export function normalizeBrandSubscriptions(
  raw?: UserBrandSubscriptions | null
): UserBrandSubscriptions {
  return {
    smartedge: raw?.smartedge ?? null,
    jonah: raw?.jonah ?? null,
  };
}

export function isBrandActive(
  snap: UserBrandSubscriptions["smartedge"] | undefined | null
): boolean {
  if (!snap || !Array.isArray(snap)) return false;
  return snap.some(s => ACTIVE.includes(s.subscriptionStatus));
}

export function formatUserPlansLabel(bs?: UserBrandSubscriptions | null): string {
  const b = normalizeBrandSubscriptions(bs);
  const parts: string[] = [];

  if (Array.isArray(b.smartedge)) {
    const activeSub = b.smartedge.find(s => ACTIVE.includes(s.subscriptionStatus));
    if (!activeSub && b.smartedge.length > 0) {
      const firstSub = b.smartedge[0];
      if (firstSub.planName && firstSub.planName !== "free") {
        parts.push(`SmartEdge: ${firstSub.planName}`);
      }
    } else if (activeSub?.planName && activeSub.planName !== "free") {
      parts.push(`SmartEdge: ${activeSub.planName}`);
    }
  }

  if (Array.isArray(b.jonah)) {
    const activeSub = b.jonah.find(s => ACTIVE.includes(s.subscriptionStatus));
    if (!activeSub && b.jonah.length > 0) {
      const firstSub = b.jonah[0];
      if (firstSub.planName && firstSub.planName !== "free") {
        parts.push(`Jonah: ${firstSub.planName}`);
      }
    } else if (activeSub?.planName && activeSub.planName !== "free") {
      parts.push(`Jonah: ${activeSub.planName}`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : "free";
}

export function aggregateSubscriptionStatus(bs?: UserBrandSubscriptions | null): SubscriptionStatus {
  const b = normalizeBrandSubscriptions(bs);

  if (isBrandActive(b.smartedge)) {
    const activeSub = Array.isArray(b.smartedge)
      ? b.smartedge.find(s => ACTIVE.includes(s.subscriptionStatus))
      : b.smartedge;
    if (activeSub) return activeSub.subscriptionStatus;
  }

  if (isBrandActive(b.jonah)) {
    const activeSub = Array.isArray(b.jonah)
      ? b.jonah.find(s => ACTIVE.includes(s.subscriptionStatus))
      : b.jonah;
    if (activeSub) return activeSub.subscriptionStatus;
  }

  const smart = Array.isArray(b.smartedge) && b.smartedge.length > 0
    ? b.smartedge[0].subscriptionStatus
    : undefined;
  const jon = Array.isArray(b.jonah) && b.jonah.length > 0
    ? b.jonah[0].subscriptionStatus
    : undefined;

  if (smart && smart !== "inactive") return smart;
  if (jon && jon !== "inactive") return jon;
  return "inactive";
}

export function userHasAnyActiveBrand(bs?: UserBrandSubscriptions | null): boolean {
  const b = normalizeBrandSubscriptions(bs);
  return isBrandActive(b.smartedge) || isBrandActive(b.jonah);
}

/** First active plan name for pricing "current plan" badges. */
export function primaryActivePlanName(bs?: UserBrandSubscriptions | null): PlanName {
  const b = normalizeBrandSubscriptions(bs);

  if (Array.isArray(b.smartedge)) {
    const activeSub = b.smartedge.find(s => ACTIVE.includes(s.subscriptionStatus));
    if (activeSub?.planName) return activeSub.planName;
  }

  if (Array.isArray(b.jonah)) {
    const activeSub = b.jonah.find(s => ACTIVE.includes(s.subscriptionStatus));
    if (activeSub?.planName) return activeSub.planName;
  }

  return "free";
}
