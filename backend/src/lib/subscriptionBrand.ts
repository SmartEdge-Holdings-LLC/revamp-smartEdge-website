import type { StripeBrand } from "../config/stripeProducts";
import { getPlanKeyFromProductId } from "../config/stripeProducts";
import type { PlanName } from "../models/User";

const SMARTEDGE_PLANS: PlanName[] = [
  "smartedgeVIP",
  "smartedgeVIPPremium",
  "monthlyStandard",
  "monthlyVip",
];

const JONAH_PLANS: PlanName[] = [
  "jonahMonthlyStandard",
  "jonahMonthlyVip",
];

export function getBrandFromPlanName(plan: PlanName): StripeBrand | null {
  if (SMARTEDGE_PLANS.includes(plan)) return "smartedge";
  if (JONAH_PLANS.includes(plan)) return "jonah";
  return null;
}

export function getBrandFromProductId(productId: string | null | undefined): StripeBrand | null {
  if (!productId?.trim()) return null;
  const key = getPlanKeyFromProductId(productId.trim());
  if (!key) return null;
  return key.startsWith("jonah") ? "jonah" : "smartedge";
}

export function resolveBrand(planName: PlanName, productId?: string | null): StripeBrand {
  return (
    getBrandFromProductId(productId) ??
    getBrandFromPlanName(planName) ??
    "smartedge"
  );
}
