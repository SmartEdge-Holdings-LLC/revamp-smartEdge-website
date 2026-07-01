import type { UserBrandSubscriptions } from "@/types/brand-subscriptions";
import { userHasAnyActiveBrand } from "@/lib/brand-subscriptions";

export const hasActiveSubscription = (user: {
  brandSubscriptions?: UserBrandSubscriptions;
}) => {
  return userHasAnyActiveBrand(user.brandSubscriptions);
};
