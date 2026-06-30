import type { PlanName, SubscriptionStatus } from "@/types";

export type BrandSubscriptionSnapshot = {
  stripeSubscriptionId: string | null;
  planName: PlanName;
  priceId: string | null;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export type UserBrandSubscriptions = {
  smartedge: BrandSubscriptionSnapshot[] | null;
  jonah: BrandSubscriptionSnapshot[] | null;
};
