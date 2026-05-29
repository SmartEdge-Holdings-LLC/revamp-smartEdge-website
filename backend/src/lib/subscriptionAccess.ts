import type { IUser } from "../models/User";
import {
  getMemberEntitlements,
  hasJonahEntitlement,
  hasSmartedgeEntitlement,
  type MemberEntitlements,
} from "../services/subscriptionEntitlementsService";

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
