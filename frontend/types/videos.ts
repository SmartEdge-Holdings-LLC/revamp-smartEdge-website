import type { PickAuthor, PickAuthorRole } from "@/types/picks";

export const VIDEO_PLATFORMS = ["youtube", "tiktok", "instagram"] as const;

export type VideoPlatform = (typeof VIDEO_PLATFORMS)[number];

export const VIDEO_STATUS = ["active", "inactive"] as const;

export type VideoStatus = (typeof VIDEO_STATUS)[number];

export const VIDEO_PLATFORM_LABELS: Record<VideoPlatform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
};

export const VIDEO_STATUS_LABELS: Record<VideoStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export interface VideoAuthor {
  _id: string;
  name: string;
  email: string;
  role: PickAuthorRole;
}

export interface AdminVideo {
  _id: string;
  platform: VideoPlatform;
  url: string;
  externalId: string | null;
  title: string;
  status: VideoStatus;
  sortOrder: number;
  embedUrl?: string | null;
  createdBy: string | VideoAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface ListVideosResponse {
  videos: AdminVideo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListVideosParams {
  page?: number;
  limit?: number;
  search?: string;
  platform?: VideoPlatform[];
  status?: VideoStatus[];
}

export interface CreateVideoPayload {
  url: string;
  title?: string;
  status: VideoStatus;
  sortOrder?: number;
}

export type UpdateVideoPayload = Partial<CreateVideoPayload>;

export type PublicVideo = Omit<AdminVideo, "createdBy">;

export interface PublicVideosResponse {
  videos: PublicVideo[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
