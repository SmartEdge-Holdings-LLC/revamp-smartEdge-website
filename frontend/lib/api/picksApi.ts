import type { League } from "@/types/picks";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export type PublicPickAuthorRole = "admin" | "subadmin" | "handicapper";

export interface PublicPickAuthor {
  name: string;
  role: PublicPickAuthorRole;
}

export interface PublicPick {
  _id: string;
  league: League;
  awayTeamId?: string;
  homeTeamId?: string;
  awayTeamName?: string;
  homeTeamName?: string;
  awayTeamLogo?: string;
  homeTeamLogo?: string;
  game: string;
  pickTitle: string;
  detailedAnalysis: string;
  odds: string;
  betType: string;
  confidence?: number;
  access: "free";
  status: "active";
  matchTime?: string;
  isPickOfDay?: boolean;
  result?: "pending" | "won" | "lost";
  createdBy?: PublicPickAuthor;
  createdAt: string;
  updatedAt: string;
}

export type PublicPickSource = "smartedge" | "handicapper";

export interface ListPublicPicksResponse {
  picks: PublicPick[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  source?: PublicPickSource;
}

export interface ListPublicPicksParams {
  page?: number;
  limit?: number;
  search?: string;
  league?: League[];
  source?: PublicPickSource;
  access?: string[];
}

export async function listPublicFreePicks(
  params: ListPublicPicksParams = {}
): Promise<ListPublicPicksResponse> {
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50) : 20;
  const url = new URL(`${backendUrl}/api/picks`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (params.search?.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  for (const lg of params.league ?? []) {
    url.searchParams.append("league", lg);
  }
  if (params.source) {
    url.searchParams.set("source", params.source);
  }
  for (const ac of params.access ?? []) {
    url.searchParams.append("access", ac);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as ListPublicPicksResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load free picks (HTTP ${res.status})`);
  }

  return data;
}

export async function getPublicFreePick(id: string): Promise<{ pick: PublicPick }> {
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const res = await fetch(`${backendUrl}/api/picks/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as { pick: PublicPick } & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load pick (HTTP ${res.status})`);
  }

  return data;
}

export async function listAuthenticatedPicks(
  params: ListPublicPicksParams = {}
): Promise<ListPublicPicksResponse> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50) : 20;
  const url = new URL("/api/picks/admin", window.location.origin);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (params.search?.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  for (const lg of params.league ?? []) {
    url.searchParams.append("league", lg);
  }
  if (params.source) {
    url.searchParams.set("source", params.source);
  }
  for (const ac of params.access ?? []) {
    url.searchParams.append("access", ac);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as ListPublicPicksResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load picks (HTTP ${res.status})`);
  }

  return data;
}
