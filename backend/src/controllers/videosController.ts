import { Request, Response } from "express";
import { z } from "zod";
import { VIDEO_PLATFORMS, VIDEO_STATUS } from "../models/Video";
import { videosService } from "../services/videosService";

const statusSchema = z.enum(VIDEO_STATUS);

const createVideoSchema = z.object({
  url: z.string().min(8).max(2048),
  title: z.string().max(200).optional(),
  status: statusSchema.default("active"),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

const updateVideoSchema = createVideoSchema.partial();

const listVideosQuerySchema = z
  .object({
    page: z.union([z.string(), z.array(z.string())]).optional(),
    limit: z.union([z.string(), z.array(z.string())]).optional(),
    search: z.union([z.string(), z.array(z.string())]).optional(),
    platform: z.union([z.string(), z.array(z.string())]).optional(),
    status: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .transform((o) => {
    const pageStr = Array.isArray(o.page) ? o.page[0] : o.page;
    const limitStr = Array.isArray(o.limit) ? o.limit[0] : o.limit;
    const searchStr = Array.isArray(o.search) ? o.search[0] : o.search;

    let page = parseInt(pageStr ?? "1", 10);
    if (!Number.isFinite(page) || page < 1) page = 1;
    let limit = parseInt(limitStr ?? "20", 10);
    if (!Number.isFinite(limit) || limit < 1) limit = 20;
    limit = Math.min(100, limit);

    const parseList = (raw: string | string[] | undefined, allowed: readonly string[]) => {
      const list: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
          ? raw.split(",")
          : [];
      return Array.from(
        new Set(
          list
            .map((s) => s.trim())
            .filter((s): s is string => (allowed as readonly string[]).includes(s))
        )
      );
    };

    const platform = parseList(o.platform, VIDEO_PLATFORMS) as (typeof VIDEO_PLATFORMS)[number][];
    const status = parseList(o.status, VIDEO_STATUS) as (typeof VIDEO_STATUS)[number][];

    return {
      page,
      limit,
      search: searchStr?.trim().slice(0, 200) || undefined,
      platform: platform.length > 0 ? platform : undefined,
      status: status.length > 0 ? status : undefined,
    };
  });

function videoIdParam(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return id ?? "";
}

export const videosController = {
  async list(req: Request, res: Response) {
    try {
      const query = listVideosQuerySchema.parse(req.query);
      const result = await videosService.findPaged(query);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const video = await videosService.findById(videoIdParam(req));
      return res.json({ video });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Video not found") return res.status(404).json({ error: msg });
      if (msg === "Invalid video id") return res.status(400).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = createVideoSchema.parse(req.body);
      const adminId = req.admin?._id?.toString();
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const video = await videosService.create({
        ...payload,
        createdBy: adminId,
      });
      return res.status(201).json({ video });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const payload = updateVideoSchema.parse(req.body);
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }
      const video = await videosService.updateById(videoIdParam(req), payload);
      return res.json({ video });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Video not found") return res.status(404).json({ error: msg });
      if (msg === "Invalid video id") return res.status(400).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const result = await videosService.deleteById(videoIdParam(req));
      return res.json(result);
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Video not found") return res.status(404).json({ error: msg });
      if (msg === "Invalid video id") return res.status(400).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },
};
