import type { SessionMemberUser } from "@/types/member-session";
import { isBrandActive } from "@/lib/brand-subscriptions";

export function hasSmartedgePaidAccess(user: SessionMemberUser): boolean {
  return isBrandActive(user.brandSubscriptions?.smartedge);
}

export function hasJonahPaidAccess(user: SessionMemberUser): boolean {
  return isBrandActive(user.brandSubscriptions?.jonah);
}

export type PaidPickFeed = "admin" | "jonah";

export function getPaidPickFeedsForUser(user: SessionMemberUser): PaidPickFeed[] {
  const feeds: PaidPickFeed[] = [];
  if (hasSmartedgePaidAccess(user)) feeds.push("admin");
  if (hasJonahPaidAccess(user)) feeds.push("jonah");
  return feeds;
}
