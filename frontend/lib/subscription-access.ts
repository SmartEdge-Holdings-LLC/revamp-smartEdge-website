import type { BrandEntitlement, MemberEntitlements } from "@/types/entitlements";
import type { SessionMemberUser } from "@/types/member-session";
import { isBrandActive } from "@/lib/brand-subscriptions";

export function hasSmartedgePaidAccess(user: SessionMemberUser): boolean {
  const ent = user.entitlements?.smartedge;
  if (ent) return ent.active;
  return isBrandActive(user.brandSubscriptions?.smartedge);
}

export function hasJonahPaidAccess(user: SessionMemberUser): boolean {
  const ent = user.entitlements?.jonah;
  if (ent) return ent.active;
  return isBrandActive(user.brandSubscriptions?.jonah);
}

export type PaidPickFeed = "admin" | "jonah";

export function getPaidPickFeedsForUser(user: SessionMemberUser): PaidPickFeed[] {
  const feeds: PaidPickFeed[] = [];
  if (hasSmartedgePaidAccess(user)) feeds.push("admin");
  if (hasJonahPaidAccess(user)) feeds.push("jonah");
  return feeds;
}

export function getActiveBrandPlans(entitlements?: MemberEntitlements | null): BrandEntitlement[] {
  if (!entitlements) return [];
  const rows: BrandEntitlement[] = [];
  if (entitlements.smartedge?.active) rows.push(entitlements.smartedge);
  if (entitlements.jonah?.active) rows.push(entitlements.jonah);
  return rows;
}
