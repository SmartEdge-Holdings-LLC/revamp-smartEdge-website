import type { IUser } from "../models/User";
import {
  getMemberEntitlements,
  hasJonahEntitlement,
  hasSmartedgeEntitlement,
  type MemberEntitlements,
} from "../services/subscriptionEntitlementsService";

export type SmartEdgeAccessTier = "none" | "standard" | "premium";

/** SmartEdge / admin desk paid picks. */
export async function hasSmartedgePaidAccess(user: IUser): Promise<boolean> {
  const entitlements = await getMemberEntitlements(user._id.toString());
  return hasSmartedgeEntitlement(entitlements);
}

/** Jonah handicapper paid picks. */
export async function hasJonahPaidAccess(user: IUser): Promise<boolean> {
  const entitlements = await getMemberEntitlements(user._id.toString());
  return hasJonahEntitlement(entitlements);
}

export function hasSmartedgePaidAccessFromEntitlements(entitlements: MemberEntitlements): boolean {
  return hasSmartedgeEntitlement(entitlements);
}

export function hasJonahPaidAccessFromEntitlements(entitlements: MemberEntitlements): boolean {
  return hasJonahEntitlement(entitlements);
}

/** Determine SmartEdge access tier based on user's subscription plan. */
export function getSmartEdgeAccessTier(entitlements: MemberEntitlements): SmartEdgeAccessTier {
  if (!entitlements.smartedge?.active) return "none";

  const planName = entitlements.smartedge.planName;
  if (planName === "smartedgeVIPPremium") return "premium";
  if (planName === "smartedgeVIP") return "standard";

  return "none";
}

/** Get allowed pick access types for SmartEdge tier. */
export function getAllowedPickAccessForSmartEdgeTier(tier: SmartEdgeAccessTier): string[] {
  switch (tier) {
    case "premium":
      return ["free", "smartedgeVIP", "smartedgeVIPPremium", "both", "tournament", "monthly_vip"]; // Premium users get all access types
    case "standard":
      return ["free", "smartedgeVIP", "monthly_vip"]; // Standard (VIP) users can see free, smartedgeVIP, and monthly_vip picks
    case "none":
      return ["free"]; // Unauthenticated users only see free picks
  }
}
