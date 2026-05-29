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
  return Boolean(snap && ACTIVE.includes(snap.subscriptionStatus));
}

export function formatUserPlansLabel(bs?: UserBrandSubscriptions | null): string {
  const b = normalizeBrandSubscriptions(bs);
  const parts: string[] = [];
  if (b.smartedge?.planName && b.smartedge.planName !== "free") {
    parts.push(`SmartEdge: ${b.smartedge.planName}`);
  }
  if (b.jonah?.planName && b.jonah.planName !== "free") {
    parts.push(`Jonah: ${b.jonah.planName}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "free";
}

export function aggregateSubscriptionStatus(bs?: UserBrandSubscriptions | null): SubscriptionStatus {
  const b = normalizeBrandSubscriptions(bs);
  if (isBrandActive(b.smartedge)) return b.smartedge!.subscriptionStatus;
  if (isBrandActive(b.jonah)) return b.jonah!.subscriptionStatus;
  const smart = b.smartedge?.subscriptionStatus;
  const jon = b.jonah?.subscriptionStatus;
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
  if (isBrandActive(b.smartedge)) return b.smartedge!.planName;
  if (isBrandActive(b.jonah)) return b.jonah!.planName;
  return "free";
}
