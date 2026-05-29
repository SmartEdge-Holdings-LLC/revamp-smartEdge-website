import type { UserBrandSubscriptions } from "@/types/brand-subscriptions";
import type { SubscriptionStatus } from "@/types";

/** Mirrors a single record from `GET /api/admin/users` (Mongo `User` document, password stripped). */
export interface AdminUserListItem {
  _id: string;
  email: string;
  name: string;
  image?: string;
  stripeCustomerId?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;
  state?: string | null;
  zip?: string | null;
  phoneNumber?: string | null;
  wpRole?: string | null;
  brandSubscriptions?: UserBrandSubscriptions;
  createdAt: string;
  updatedAt: string;
}

/** Display helpers for admin tables. */
export function adminUserPlansLabel(u: AdminUserListItem): string {
  const bs = u.brandSubscriptions;
  if (!bs) return "—";
  const parts: string[] = [];
  if (bs.smartedge?.planName && bs.smartedge.planName !== "free") parts.push(bs.smartedge.planName);
  if (bs.jonah?.planName && bs.jonah.planName !== "free") parts.push(bs.jonah.planName);
  return parts.length > 0 ? parts.join(" · ") : "free";
}

export function adminUserAggregateStatus(u: AdminUserListItem): SubscriptionStatus {
  const bs = u.brandSubscriptions;
  if (!bs) return "inactive";
  const active = ["active", "trialing"];
  if (bs.smartedge && active.includes(bs.smartedge.subscriptionStatus)) {
    return bs.smartedge.subscriptionStatus;
  }
  if (bs.jonah && active.includes(bs.jonah.subscriptionStatus)) {
    return bs.jonah.subscriptionStatus;
  }
  return bs.smartedge?.subscriptionStatus ?? bs.jonah?.subscriptionStatus ?? "inactive";
}

/** Shape of `GET /api/admin/users?page=&limit=` response (see `userService.findPagedForAdmin`). */
export interface ListUsersResponse {
  users: AdminUserListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionStatus[];
  /** Inclusive lower bound on `createdAt`. Accepts `YYYY-MM-DD` or full ISO-8601. */
  joinedFrom?: string;
  /** Inclusive upper bound on `createdAt`. Accepts `YYYY-MM-DD` or full ISO-8601. */
  joinedTo?: string;
}

export interface JonahUserListItem {
  _id: string;
  email: string;
  name: string;
  stripeCustomerId?: string | null;
  subscriptionId?: string | null;
  subscriptionStatus: SubscriptionStatus;
  currentPlan: string;
  priceId?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  jonahProductId?: string | null;
  jonahProductName?: string | null;
}

/** `GET /api/admin/jonah-users` — subscribers on configured Jonah Stripe products. */
export interface JonahUsersResponse {
  products: { id: string; name: string }[];
  priceIds: string[];
  lastSyncedAt?: string | null;
  users: JonahUserListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ListJonahUsersParams = ListUsersParams;
