import mongoose from "mongoose";
import { embedUrlForVideo, parseVideoUrl } from "../lib/videoUrl";
import { Video, type IVideo, type VideoPlatform, type VideoStatus } from "../models/Video";

const CREATED_BY_FIELDS = "name email role";

export type VideoCreateInput = {
  url: string;
  title?: string;
  status?: VideoStatus;
  sortOrder?: number;
  createdBy: string;
};

export type VideoUpdateInput = {
  url?: string;
  title?: string;
  status?: VideoStatus;
  sortOrder?: number;
};

export type VideoListOptions = {
  page: number;
  limit: number;
  search?: string;
  platform?: VideoPlatform[];
  status?: VideoStatus[];
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function leanWithEmbed<T extends IVideo & { _id: mongoose.Types.ObjectId }>(doc: T) {
  const o = doc as T & { embedUrl?: string | null };
  o.embedUrl = embedUrlForVideo(doc.platform, doc.url, doc.externalId);
  return o;
}

export const videosService = {
  async create(input: VideoCreateInput) {
    if (!mongoose.Types.ObjectId.isValid(input.createdBy)) {
      throw new Error("Invalid admin id");
    }
    const parsed = parseVideoUrl(input.url);
    const video = await Video.create({
      platform: parsed.platform,
      url: parsed.url,
      externalId: parsed.externalId,
      title: (input.title ?? "").trim(),
      status: input.status ?? "active",
      sortOrder: input.sortOrder ?? 0,
      createdBy: input.createdBy,
    });
    return this.findById(video._id.toString());
  },

  async findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid video id");
    }
    const video = await Video.findById(id)
      .populate("createdBy", CREATED_BY_FIELDS)
      .lean();
    if (!video) throw new Error("Video not found");
    return leanWithEmbed(video);
  },

  async findPaged(options: VideoListOptions) {
    const { page, limit, search, platform, status } = options;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    const trimmed = search?.trim();
    if (trimmed) {
      const escaped = escapeRegex(trimmed);
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { url: { $regex: escaped, $options: "i" } },
        { platform: { $regex: escaped, $options: "i" } },
      ];
    }
    if (platform && platform.length > 0) {
      filter.platform = { $in: platform };
    }
    if (status && status.length > 0) {
      filter.status = { $in: status };
    }

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .sort({ sortOrder: -1, createdAt: -1 })
        .populate("createdBy", CREATED_BY_FIELDS)
        .skip(skip)
        .limit(limit)
        .lean(),
      Video.countDocuments(filter),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    return {
      videos: videos.map((v) => leanWithEmbed(v)),
      page,
      limit,
      total,
      totalPages,
    };
  },

  /** Public feed — active videos only (legacy simple list). */
  async listPublic(limit = 50) {
    const result = await this.findPublicActivePaged({ page: 1, limit });
    return result.videos;
  },

  /** Paginated public list — always `status: active`, no auth. */
  async findPublicActivePaged(options: {
    page: number;
    limit: number;
    search?: string;
    platform?: VideoPlatform[];
  }) {
    const { page, limit, search, platform } = options;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { status: "active" };

    const trimmed = search?.trim();
    if (trimmed) {
      const escaped = escapeRegex(trimmed);
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { url: { $regex: escaped, $options: "i" } },
        { platform: { $regex: escaped, $options: "i" } },
      ];
    }
    if (platform && platform.length > 0) {
      filter.platform = { $in: platform };
    }

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .sort({ sortOrder: -1, createdAt: -1 })
        .select("-createdBy")
        .skip(skip)
        .limit(limit)
        .lean(),
      Video.countDocuments(filter),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    return {
      videos: videos.map((v) => leanWithEmbed(v)),
      page,
      limit,
      total,
      totalPages,
    };
  },

  async findPublicActiveById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid video id");
    }
    const video = await Video.findOne({ _id: id, status: "active" })
      .select("-createdBy")
      .lean();
    if (!video) throw new Error("Video not found");
    return leanWithEmbed(video);
  },

  async updateById(id: string, input: VideoUpdateInput) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid video id");
    }
    const update: Partial<IVideo> = {};

    if (input.url !== undefined) {
      const parsed = parseVideoUrl(input.url);
      update.platform = parsed.platform;
      update.url = parsed.url;
      update.externalId = parsed.externalId;
    }
    if (input.title !== undefined) update.title = input.title.trim();
    if (input.status !== undefined) update.status = input.status;
    if (input.sortOrder !== undefined) update.sortOrder = input.sortOrder;

    const video = await Video.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!video) throw new Error("Video not found");
    return this.findById(id);
  },

  async deleteById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid video id");
    }
    const result = await Video.findByIdAndDelete(id);
    if (!result) throw new Error("Video not found");
    return { deleted: true as const };
  },
};
