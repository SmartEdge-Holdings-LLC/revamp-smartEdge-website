import { getStripeProductId } from "@/lib/stripe";
import type { StripeBrand, StripeTier } from "@/lib/stripe-product-types";

/** Tier keys used in pricing UI and URL (`vip` / `vip-premium` map to Stripe tiers). */
export type PlanTierParam = "vip" | "vip-premium";

export type SubscriptionPlanSelection = {
  brand: StripeBrand;
  tier: PlanTierParam;
};

const BRANDS: StripeBrand[] = ["smartedge", "jonah"];
const TIERS: PlanTierParam[] = ["vip", "vip-premium"];

const TIER_TO_STRIPE: Record<PlanTierParam, StripeTier> = {
  vip: "monthlyStandard",
  "vip-premium": "monthlyVip",
};

const PLAN_LABELS: Record<StripeBrand, Record<PlanTierParam, string>> = {
  smartedge: {
    vip: "Monthly VIP",
    "vip-premium": "Monthly VIP Premium",
  },
  jonah: {
    vip: "jonahvip",
    "vip-premium": "jonah-vip-premium",
  },
};

export function parseSubscriptionPlanParams(
  brand: string | null | undefined,
  tier: string | null | undefined
): SubscriptionPlanSelection | null {
  if (!brand || !tier) return null;
  if (!BRANDS.includes(brand as StripeBrand)) return null;
  if (!TIERS.includes(tier as PlanTierParam)) return null;
  return { brand: brand as StripeBrand, tier: tier as PlanTierParam };
}

export function buildRegisterPlanUrl(brand: StripeBrand, tier: PlanTierParam): string {
  const params = new URLSearchParams({ brand, tier });
  return `/register?${params.toString()}`;
}

export function getProductIdForPlan(selection: SubscriptionPlanSelection): string {
  return getStripeProductId(selection.brand, TIER_TO_STRIPE[selection.tier]);
}

export function getPlanDisplayName(selection: SubscriptionPlanSelection): string {
  return PLAN_LABELS[selection.brand][selection.tier];
}

export function planSearchParams(selection: SubscriptionPlanSelection): URLSearchParams {
  return new URLSearchParams({ brand: selection.brand, tier: selection.tier });
}
