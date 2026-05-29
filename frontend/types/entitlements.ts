import type { PlanName, SubscriptionStatus } from "@/types";

export type SubscriptionBrand = "smartedge" | "jonah";

export type BrandEntitlement = {
  brand: SubscriptionBrand;
  active: boolean;
  planName: PlanName;
  subscriptionStatus: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type MemberEntitlements = {
  smartedge: BrandEntitlement | null;
  jonah: BrandEntitlement | null;
};
