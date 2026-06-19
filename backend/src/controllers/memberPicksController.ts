import { Request, Response } from "express";
import { z } from "zod";
import {
  hasJonahPaidAccess,
  hasSmartedgePaidAccess,
} from "../lib/subscriptionAccess";
import { LEAGUES } from "../models/Pick";
import { picksService } from "../services/picksService";

const listPaidQuerySchema = z
  .object({
    page: z.union([z.string(), z.array(z.string())]).optional(),
    limit: z.union([z.string(), z.array(z.string())]).optional(),
    search: z.union([z.string(), z.array(z.string())]).optional(),
    league: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .transform((o) => {
    const pageStr = Array.isArray(o.page) ? o.page[0] : o.page;
    const limitStr = Array.isArray(o.limit) ? o.limit[0] : o.limit;
    const searchStr = Array.isArray(o.search) ? o.search[0] : o.search;

    let page = parseInt(pageStr ?? "1", 10);
    if (!Number.isFinite(page) || page < 1) page = 1;
    let limit = parseInt(limitStr ?? "20", 10);
    if (!Number.isFinite(limit) || limit < 1) limit = 20;
    limit = Math.min(50, limit);

    const rawLeague = o.league;
    const leagueList: string[] = Array.isArray(rawLeague)
      ? rawLeague
      : typeof rawLeague === "string"
        ? rawLeague.split(",")
        : [];
    const league = Array.from(
      new Set(
        leagueList
          .map((s) => s.trim())
          .filter((s): s is (typeof LEAGUES)[number] =>
            (LEAGUES as readonly string[]).includes(s)
          )
      )
    );

    return {
      page,
      limit,
      search: searchStr?.trim().slice(0, 200) || undefined,
      league: league.length > 0 ? league : undefined,
    };
  });

export const memberPicksController = {
  /** Paid picks from SmartEdge admin desk (`admin` / `subadmin` authors). Requires member JWT. Full analysis only with SmartEdge plan. */
  async listAdminPaid(req: Request, res: Response) {
    try {
      const user = req.user!;
      const hasSmartedgeAccess = await hasSmartedgePaidAccess(user);

      const { page, limit, search, league } = listPaidQuerySchema.parse(req.query);
      const result = await picksService.findPaidPagedBySource({
        page,
        limit,
        search,
        league,
        source: "admin",
      });

      // If user doesn't have SmartEdge access, strip analysis for preview mode
      if (!hasSmartedgeAccess) {
        return res.json({
          ...result,
          picks: result.picks.map((pick) => ({
            ...pick,
            detailedAnalysis: "", // Strip analysis - user sees blurred preview only
          })),
        });
      }

      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  /** Paid picks from Jonah handicapper. Requires member JWT. Full analysis only with Jonah plan. */
  async listJonahPaid(req: Request, res: Response) {
    try {
      const user = req.user!;
      const hasJonahAccess = await hasJonahPaidAccess(user);

      const { page, limit, search, league } = listPaidQuerySchema.parse(req.query);
      const result = await picksService.findPaidPagedBySource({
        page,
        limit,
        search,
        league,
        source: "jonah",
      });

      // If user doesn't have Jonah access, strip analysis for preview mode
      if (!hasJonahAccess) {
        return res.json({
          ...result,
          picks: result.picks.map((pick) => ({
            ...pick,
            detailedAnalysis: "", // Strip analysis - user sees blurred preview only
          })),
        });
      }

      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
};
