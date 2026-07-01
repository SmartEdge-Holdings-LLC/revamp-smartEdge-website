import { Request, Response } from "express";
import { z } from "zod";
import { LEAGUES, PICK_ACCESS } from "../models/Pick";
import { picksService } from "../services/picksService";

const leagueSchema = z.enum(LEAGUES);

const listPublicQuerySchema = z
  .object({
    page: z.union([z.string(), z.array(z.string())]).optional(),
    limit: z.union([z.string(), z.array(z.string())]).optional(),
    search: z.union([z.string(), z.array(z.string())]).optional(),
    league: z.union([z.string(), z.array(z.string())]).optional(),
    source: z.union([z.string(), z.array(z.string())]).optional(),
    access: z.union([z.string(), z.array(z.string())]).optional(),
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

    const rawSource = Array.isArray(o.source) ? o.source[0] : o.source;
    const source = (
      rawSource === "smartedge" || rawSource === "handicapper" ? rawSource : undefined
    ) as "smartedge" | "handicapper" | undefined;

    const rawAccess = o.access;
    const accessList: string[] = Array.isArray(rawAccess)
      ? rawAccess
      : typeof rawAccess === "string"
        ? rawAccess.split(",")
        : [];
    const access = Array.from(
      new Set(
        accessList
          .map((s) => s.trim())
          .filter((s): s is (typeof PICK_ACCESS)[number] =>
            (PICK_ACCESS as readonly string[]).includes(s)
          )
      )
    );

    return {
      page,
      limit,
      search: searchStr?.trim().slice(0, 200) || undefined,
      league: league.length > 0 ? league : undefined,
      source,
      access: access.length > 0 ? access : undefined,
    };
  });

function pickIdParam(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return id ?? "";
}

export const publicPicksController = {
  /** Active picks (no auth). Filters by access type if provided, otherwise defaults to free. */
  async list(req: Request, res: Response) {
    try {
      const { page, limit, search, league, source, access } = listPublicQuerySchema.parse(req.query);

      if (access && access.length > 0) {
        // Use regular findPaged when access filter is specified
        const result = await picksService.findPaged({
          page,
          limit,
          search,
          league,
          access,
          status: ["active"],
        });

        // Mask sensitive fields for non-logged-in users on non-free access types
        const isAuthenticated = req.headers.authorization !== undefined;
        if (!isAuthenticated) {
          result.picks = result.picks.map((pick) => ({
            ...pick,
            pickTitle: pick.access !== "free" ? "Locked" : pick.pickTitle,
            detailedAnalysis: pick.access !== "free" ? "Sign in to view analysis" : pick.detailedAnalysis,
            odds: pick.access !== "free" ? "Locked" : pick.odds,
            confidence: pick.access !== "free" ? undefined : pick.confidence,
          }));
        }

        return res.json(result);
      } else {
        // Default to free picks for backward compatibility
        const result = await picksService.findPublicFreePaged({
          page,
          limit,
          search,
          league,
          source,
        });
        return res.json(result);
      }
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const pick = await picksService.findPublicFreeById(pickIdParam(req));
      return res.json({ pick });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg === "Pick not found") return res.status(404).json({ error: msg });
      if (msg === "Invalid pick id") return res.status(400).json({ error: msg });
      return res.status(400).json({ error: msg });
    }
  },

  async listHottestPicks(req: Request, res: Response) {
    try {
      const { page, limit } = listPublicQuerySchema.parse(req.query);
      const result = await picksService.findHottestPicked({
        page,
        limit,
      });
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
};
