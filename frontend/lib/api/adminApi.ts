"use client";

import { getCookie } from "cookies-next";
import { AUTH_COOKIE } from "@/lib/authCookies";
import type {
  JonahUsersResponse,
  ListJonahUsersParams,
  ListUsersParams,
  ListUsersResponse,
} from "@/types/admin";
import type {
  AdminPick,
  CreatePickPayload,
  League,
  LeagueTeamsResponse,
  ListPicksParams,
  ListPicksResponse,
  UpdatePickPayload,
} from "@/types/picks";
import type {
  AdminVideo,
  CreateVideoPayload,
  ListVideosParams,
  ListVideosResponse,
  UpdateVideoPayload,
} from "@/types/videos";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

/** Reads the admin JWT persisted at login from the `sep_token` cookie (client-side only). */
function readAdminToken(): string {
  const token = getCookie(AUTH_COOKIE.TOKEN);
  if (typeof token !== "string" || token.length === 0) {
    throw new AdminApiError(
      "Not authenticated. Please sign in as an admin.",
      401
    );
  }
  return token;
}

/**
 * `GET /api/admin/users?page=&limit=` — admin-only paginated user list.
 *
 * Token comes from the `sep_token` cookie (set by the login flow). It is sent
 * via the standard `Authorization: Bearer …` header (what `adminAuthMiddleware`
 * reads) and additionally as a `sep_token` request header for callers that
 * inspect it directly.
 */
export async function listAdminUsers(
  params: ListUsersParams = {}
): Promise<ListUsersResponse> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL", 500);
  }
  const token = readAdminToken();

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 20;
  const search = params.search?.trim();
  const status = params.status ?? [];
  const joinedFrom = params.joinedFrom?.trim();
  const joinedTo = params.joinedTo?.trim();

  const url = new URL(`${backendUrl}/api/admin/users`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (search) {
    url.searchParams.set("search", search);
  }
  for (const s of status) {
    url.searchParams.append("status", s);
  }
  if (joinedFrom) {
    url.searchParams.set("joinedFrom", joinedFrom);
  }
  if (joinedTo) {
    url.searchParams.set("joinedTo", joinedTo);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      sep_token: token,
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as
    | ListUsersResponse
    | { error?: string };

  if (!res.ok) {
    const message =
      (data as { error?: string }).error ??
      `Failed to load users (HTTP ${res.status})`;
    throw new AdminApiError(message, res.status);
  }

  return data as ListUsersResponse;
}

/**
 * `GET /api/admin/jonah-users` — subscribers on Jonah weekly / monthly / VIP products.
 */
export async function listJonahUsers(
  params: ListJonahUsersParams = {}
): Promise<JonahUsersResponse> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL", 500);
  }
  const token = readAdminToken();

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 20;
  const search = params.search?.trim();
  const status = params.status ?? [];
  const joinedFrom = params.joinedFrom?.trim();
  const joinedTo = params.joinedTo?.trim();

  const url = new URL(`${backendUrl}/api/admin/jonah-users`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (search) {
    url.searchParams.set("search", search);
  }
  for (const s of status) {
    url.searchParams.append("status", s);
  }
  if (joinedFrom) {
    url.searchParams.set("joinedFrom", joinedFrom);
  }
  if (joinedTo) {
    url.searchParams.set("joinedTo", joinedTo);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      sep_token: token,
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as JonahUsersResponse | { error?: string };

  if (!res.ok) {
    const message =
      (data as { error?: string }).error ??
      `Failed to load Jonah subscribers (HTTP ${res.status})`;
    throw new AdminApiError(message, res.status);
  }

  return data as JonahUsersResponse;
}

async function adminFetch<T>(
  path: string,
  init?: RequestInit & { parseJson?: boolean }
): Promise<T> {
  if (!backendUrl) {
    throw new AdminApiError("Missing NEXT_PUBLIC_BACKEND_URL", 500);
  }
  const token = readAdminToken();
  const res = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      sep_token: token,
      ...init?.headers,
    },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    const message = data.error ?? `Request failed (HTTP ${res.status})`;
    throw new AdminApiError(message, res.status);
  }
  return data;
}

/** Teams + logos for matchup dropdowns (reads `public/leagues/{league}/` via Next API). */
export async function listLeagueTeams(league: League): Promise<LeagueTeamsResponse> {
  const url = `/api/league-teams?league=${encodeURIComponent(league)}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as LeagueTeamsResponse & { error?: string };
  if (!res.ok) {
    throw new AdminApiError(data.error ?? `Failed to load teams (HTTP ${res.status})`, res.status);
  }
  return data as LeagueTeamsResponse;
}

/** `GET /api/admin/picks` — paginated picks for admin console. */
export async function listAdminPicks(
  params: ListPicksParams = {}
): Promise<ListPicksResponse> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 20;
  const url = new URL(`${backendUrl}/api/admin/picks`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (params.search?.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  for (const bt of params.betType ?? []) {
    url.searchParams.append("betType", bt);
  }
  for (const lg of params.league ?? []) {
    url.searchParams.append("league", lg);
  }
  return adminFetch<ListPicksResponse>(url.pathname + url.search, { method: "GET" });
}

/** `GET /api/admin/picks/:id` */
export async function getAdminPick(id: string): Promise<{ pick: AdminPick }> {
  return adminFetch<{ pick: AdminPick }>(`/api/admin/picks/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

/** `POST /api/admin/picks` */
export async function createAdminPick(
  payload: CreatePickPayload
): Promise<{ pick: AdminPick }> {
  return adminFetch<{ pick: AdminPick }>("/api/admin/picks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** `PUT /api/admin/picks/:id` */
export async function updateAdminPick(
  id: string,
  payload: UpdatePickPayload
): Promise<{ pick: AdminPick }> {
  return adminFetch<{ pick: AdminPick }>(`/api/admin/picks/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** `DELETE /api/admin/picks/:id` */
export async function deleteAdminPick(id: string): Promise<{ deleted: boolean }> {
  return adminFetch<{ deleted: boolean }>(`/api/admin/picks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** `GET /api/admin/videos` */
export async function listAdminVideos(
  params: ListVideosParams = {}
): Promise<ListVideosResponse> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 20;
  const url = new URL(`${backendUrl}/api/admin/videos`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (params.search?.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  for (const p of params.platform ?? []) {
    url.searchParams.append("platform", p);
  }
  for (const s of params.status ?? []) {
    url.searchParams.append("status", s);
  }
  return adminFetch<ListVideosResponse>(url.pathname + url.search, { method: "GET" });
}

export async function getAdminVideo(id: string): Promise<{ video: AdminVideo }> {
  return adminFetch<{ video: AdminVideo }>(`/api/admin/videos/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function createAdminVideo(
  payload: CreateVideoPayload
): Promise<{ video: AdminVideo }> {
  return adminFetch<{ video: AdminVideo }>("/api/admin/videos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminVideo(
  id: string,
  payload: UpdateVideoPayload
): Promise<{ video: AdminVideo }> {
  return adminFetch<{ video: AdminVideo }>(`/api/admin/videos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminVideo(id: string): Promise<{ deleted: boolean }> {
  return adminFetch<{ deleted: boolean }>(`/api/admin/videos/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export interface AdminSendTestSmsPayload {
  phoneNumber: string;
  message?: string;
}

export interface AdminSendTestSmsResponse {
  success: boolean;
  to: string;
  messageId: string | null;
  message: string;
}

export interface AdminBroadcastSmsPayload {
  message?: string;
  delayMs?: number;
}

export interface AdminBroadcastSmsResponse {
  success: boolean;
  message: string;
  delayMs?: number;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  failures: Array<{ phoneNumber: string; error: string }>;
}

export async function adminSendTestSms(
  payload: AdminSendTestSmsPayload
): Promise<AdminSendTestSmsResponse> {
  return adminFetch<AdminSendTestSmsResponse>("/api/admin/sms/test", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminBroadcastSms(
  payload: AdminBroadcastSmsPayload = {}
): Promise<AdminBroadcastSmsResponse> {
  return adminFetch<AdminBroadcastSmsResponse>("/api/admin/sms/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface AdminUpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface MessageOkResponse {
  message: string;
}

export async function adminUpdatePassword(
  payload: AdminUpdatePasswordPayload
): Promise<MessageOkResponse> {
  return adminFetch<MessageOkResponse>("/api/admin/password/update", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface AdminProfile {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "subadmin" | "handicapper";
  createdAt?: string;
  updatedAt?: string;
}

export type AdminAnalyticsOverview = {
  weeklyActiveUsers: number;
  totalInactiveSubscribers: number;
  totalUsers: number;
  smartedgeActiveSubscribers: number;
  jonahActiveSubscribers: number;
  churnRatePercent: number;
  newSubscriptionsWeekly: number;
  averageRevenuePerCustomer: number;
  currency: string;
  monthlyRecurringRevenue: number;
  weeklyRevenue: number;
  generatedAt: string;
  period: {
    weeklyActiveFrom: string;
    churnWindowDays: number;
    revenueWindowDays: number;
  };
};

/** `GET /api/admin/analytics` — dashboard KPIs (users + Stripe revenue). */
export async function getAdminAnalytics(): Promise<{ analytics: AdminAnalyticsOverview }> {
  return adminFetch<{ analytics: AdminAnalyticsOverview }>("/api/admin/analytics", {
    method: "GET",
  });
}

export type SalesRange = "7d" | "4w" | "90d";

export type DailySalePoint = {
  date: string;
  amount: number;
  amountCents: number;
};

export type AdminSalesByDayResponse = {
  range: SalesRange;
  days: number;
  currency: string;
  total: number;
  totalCents: number;
  salesByDay: DailySalePoint[];
  generatedAt: string;
};

/** `GET /api/admin/analytics/sales?range=` — Stripe gross sales per day for charts. */
export async function getAdminSalesByDay(
  range: SalesRange = "7d"
): Promise<AdminSalesByDayResponse> {
  return adminFetch<AdminSalesByDayResponse>(
    `/api/admin/analytics/sales?range=${encodeURIComponent(range)}`,
    { method: "GET" }
  );
}

export async function getAdminProfile(): Promise<{ admin: AdminProfile }> {
  return adminFetch<{ admin: AdminProfile }>("/api/admin/profile", {
    method: "GET",
  });
}

export { AdminApiError };
