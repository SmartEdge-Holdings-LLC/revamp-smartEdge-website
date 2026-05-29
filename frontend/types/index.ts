export type PlanName =
  | "free"
  | "smartedgeWeekly"
  | "smartedgeMonthlyStandard"
  | "smartedgeMonthlyVip"
  | "jonahWeekly"
  | "jonahMonthlyStandard"
  | "jonahMonthlyVip"
  | "weekly"
  | "monthlyStandard"
  | "monthlyVip"
  | "starter"
  | "pro"
  | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid";

import type { UserBrandSubscriptions } from "@/types/brand-subscriptions";
import type { MemberEntitlements } from "@/types/entitlements";

export interface User {
  _id: string;
  email: string;
  name: string;
  image?: string;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  state?: string | null;
  zip?: string | null;
  discordUsername?: string | null;
  phoneNumber?: string | null;
  brandSubscriptions?: UserBrandSubscriptions;
  entitlements?: MemberEntitlements;
  onboarding?: boolean;
}

export interface Subscription {
  brandSubscriptions?: UserBrandSubscriptions;
  entitlements?: MemberEntitlements;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface Plan {
  name: PlanName;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  productId?: string;
}
