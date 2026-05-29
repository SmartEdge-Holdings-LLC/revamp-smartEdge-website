import { getStripeProductId } from "@/lib/stripe";
import type { StripeBrand, StripeTier } from "@/lib/stripe-product-types";

/** Tier keys used in pricing UI and URL (`standard` / `vip` map to Stripe tiers). */
export type PlanTierParam = "weekly" | "standard" | "vip";

export type SubscriptionPlanSelection = {
  brand: StripeBrand;
  tier: PlanTierParam;
};

const BRANDS: StripeBrand[] = ["smartedge", "jonah"];
const TIERS: PlanTierParam[] = ["weekly", "standard", "vip"];

const TIER_TO_STRIPE: Record<PlanTierParam, StripeTier> = {
  weekly: "weekly",
  standard: "monthlyStandard",
  vip: "monthlyVip",
};

const PLAN_LABELS: Record<StripeBrand, Record<PlanTierParam, string>> = {
  smartedge: {
    weekly: "Weekly VIP Standard",
    standard: "Monthly VIP Standard",
    vip: "Monthly VIP Premium",
  },
  jonah: {
    weekly: "Jonah's Weekly",
    standard: "Jonah's Monthly Standard",
    vip: "Jonah's Monthly VIP",
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
