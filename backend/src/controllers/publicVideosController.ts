import { Request, Response } from "express";
import { z } from "zod";
import { VIDEO_PLATFORMS } from "../models/Video";
import { videosService } from "../services/videosService";

const listPublicQuerySchema = z
  .object({
    page: z.union([z.string(), z.array(z.string())]).optional(),
    limit: z.union([z.string(), z.array(z.string())]).optional(),
    search: z.union([z.string(), z.array(z.string())]).optional(),
    platform: z.union([z.string(), z.array(z.string())]).optional(),
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

    const rawPlatform = o.platform;
    const platformList: string[] = Array.isArray(rawPlatform)
      ? rawPlatform
      : typeof rawPlatform === "string"
        ? rawPlatform.split(",")
        : [];
    const platform = Array.from(
      new Set(
        platformList
          .map((s) => s.trim())
          .filter((s): s is (typeof VIDEO_PLATFORMS)[number] =>
            (VIDEO_PLATFORMS as readonly string[]).includes(s)
          )
      )
    );

    return {
      page,
      limit,
      search: searchStr?.trim().slice(0, 200) || undefined,
      platform: platform.length > 0 ? platform : undefined,
    };
  });

function videoIdParam(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return id ?? "";
}

export const publicVideosController = {
  /** Active videos only (no auth). Mirrors admin list shape without inactive rows. */
  async list(req: Request, res: Response) {
    try {
      const { page, limit, search, platform } = listPublicQuerySchema.parse(req.query);
      const result = await videosService.findPublicActivePaged({
        page,
        limit,
        search,
        platform,
      });
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const video = await videosService.findPublicActiveById(videoIdParam(req));
      return res.json({ video });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Video not found") return res.status(404).json({ error: msg });
      if (msg === "Invalid video id") return res.status(400).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },
};
