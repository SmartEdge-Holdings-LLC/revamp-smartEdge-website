import type { UserBrandSubscriptions } from "@/types/brand-subscriptions";
import { userHasAnyActiveBrand } from "@/lib/brand-subscriptions";

export const hasActiveSubscription = (user: {
  brandSubscriptions?: UserBrandSubscriptions;
  entitlements?: { smartedge?: { active?: boolean } | null; jonah?: { active?: boolean } | null };
}) => {
  if (user.entitlements?.smartedge?.active || user.entitlements?.jonah?.active) {
    return true;
  }
  return userHasAnyActiveBrand(user.brandSubscriptions);
};
