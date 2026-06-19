import type { League } from "@/types/picks";
import type { PublicPickAuthor } from "@/lib/api/picksApi";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface PaidPick {
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
  access: "paid";
  status: "active";
  matchTime?: string;
  isPickOfDay?: boolean;
  createdBy?: PublicPickAuthor;
  createdAt: string;
  updatedAt: string;
}

export type PaidPickFeed = "admin" | "jonah";

export interface ListPaidPicksResponse {
  picks: PaidPick[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  source: PaidPickFeed;
}

export interface ListPaidPicksParams {
  page?: number;
  limit?: number;
  search?: string;
  league?: League[];
}

export async function listPaidPicks(
  token: string,
  feed: PaidPickFeed,
  params: ListPaidPicksParams = {}
): Promise<ListPaidPicksResponse> {
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50) : 20;
  const url = new URL(`${backendUrl}/api/picks/paid/${feed}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (params.search?.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  for (const lg of params.league ?? []) {
    url.searchParams.append("league", lg);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as ListPaidPicksResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load paid picks (HTTP ${res.status})`);
  }

  return data;
}
