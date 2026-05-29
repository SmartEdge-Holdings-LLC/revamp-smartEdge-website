import type { AdminVideo, ListVideosParams, VideoPlatform } from "@/types/videos";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export type PublicVideo = Omit<AdminVideo, "createdBy" | "status"> & {
  status: "active";
};

export interface ListPublicVideosResponse {
  videos: PublicVideo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function listPublicVideos(
  params: Pick<ListVideosParams, "page" | "limit" | "search" | "platform"> = {}
): Promise<ListPublicVideosResponse> {
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 100) : 20;
  const url = new URL(`${backendUrl}/api/videos`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  if (params.search?.trim()) {
    url.searchParams.set("search", params.search.trim());
  }
  for (const p of params.platform ?? []) {
    url.searchParams.append("platform", p);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as ListPublicVideosResponse & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load videos (HTTP ${res.status})`);
  }

  return data;
}

export async function getPublicVideo(id: string): Promise<{ video: PublicVideo }> {
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }

  const res = await fetch(`${backendUrl}/api/videos/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as { video: PublicVideo } & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? `Failed to load video (HTTP ${res.status})`);
  }

  return data;
}

export type { VideoPlatform };
