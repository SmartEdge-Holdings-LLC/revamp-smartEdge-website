import { Request, Response } from "express";
import { z } from "zod";
import { getLeagueTeams } from "../config/leagueTeams";
import { isBetTypeAllowedForLeague } from "../config/pickBetTypes";
import { BET_TYPES, LEAGUES, PICK_ACCESS, PICK_RESULTS, PICK_STATUS } from "../models/Pick";
import { picksService } from "../services/picksService";

const betTypeSchema = z.enum(BET_TYPES);
const leagueSchema = z.enum(LEAGUES);
const pickAccessSchema = z.enum(PICK_ACCESS);
const pickStatusSchema = z.enum(PICK_STATUS);

const pickBodySchema = z.object({
  league: leagueSchema,
  useCustomMatchup: z.boolean().optional(),
  awayTeamId: z.string().max(100).optional(),
  homeTeamId: z.string().max(100).optional(),
  awayTeamName: z.string().max(120).optional(),
  homeTeamName: z.string().max(120).optional(),
  game: z.string().max(500).optional(),
  pickTitle: z.string().min(1).max(300),
  detailedAnalysis: z.string().min(1).max(10000).optional().or(z.literal("")),
  odds: z.string().min(1).max(64).optional().or(z.literal("")),
  betType: betTypeSchema,
  confidence: z.coerce.number().int().min(1).max(100).optional(),
  access: pickAccessSchema.default("smartedgeVIPPremium"),
  status: pickStatusSchema.default("active"),
  matchTime: z.string().datetime().optional(),
  isPickOfDay: z.boolean().optional(),
  result: z.enum(PICK_RESULTS).optional(),
});

function refinePickBody(data: z.infer<typeof pickBodySchema>, ctx: z.RefinementCtx) {
  if (!isBetTypeAllowedForLeague(data.league, data.betType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["betType"],
      message: `Bet type "${data.betType}" is not valid for league ${data.league}`,
    });
  }

  const custom = data.useCustomMatchup === true;
  const awayName = data.awayTeamName?.trim() ?? "";
  const homeName = data.homeTeamName?.trim() ?? "";
  const awayId = data.awayTeamId?.trim() ?? "";
  const homeId = data.homeTeamId?.trim() ?? "";

  if (custom) {
    if (!awayName || !homeName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["awayTeamName"],
        message: "Away and home names are required for a custom matchup",
      });
    }
    return;
  }

  if (!awayId || !homeId) {
    if (!awayName || !homeName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["awayTeamId"],
        message: "Select away and home teams, or use a custom matchup",
      });
    }
  }
}

const createPickSchema = pickBodySchema.superRefine(refinePickBody);

/** Zod v4: `.partial()` cannot be applied to schemas with refinements — use the base object. */
const updatePickSchema = pickBodySchema.partial();

const listPicksQuerySchema = z
  .object({
    page: z.union([z.string(), z.array(z.string())]).optional(),
    limit: z.union([z.string(), z.array(z.string())]).optional(),
    search: z.union([z.string(), z.array(z.string())]).optional(),
    betType: z.union([z.string(), z.array(z.string())]).optional(),
    league: z.union([z.string(), z.array(z.string())]).optional(),
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
    limit = Math.min(100, limit);
    const search = searchStr?.trim().slice(0, 200) || undefined;

    const rawBetType = o.betType;
    const betTypeList: string[] = Array.isArray(rawBetType)
      ? rawBetType
      : typeof rawBetType === "string"
        ? rawBetType.split(",")
        : [];
    const betType = Array.from(
      new Set(
        betTypeList
          .map((s) => s.trim())
          .filter((s): s is (typeof BET_TYPES)[number] =>
            (BET_TYPES as readonly string[]).includes(s)
          )
      )
    );

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
      search,
      betType: betType.length > 0 ? betType : undefined,
      league: league.length > 0 ? league : undefined,
      access: access.length > 0 ? access : undefined,
    };
  });

function pickIdParam(req: Request): string {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  return id ?? "";
}

function handicapperAuthorId(req: Request): string | undefined {
  return req.admin?.role === "handicapper" ? req.admin._id.toString() : undefined;
}

function mapPickError(res: Response, msg: string) {
  if (msg === "Pick not found") return res.status(404).json({ error: msg });
  if (msg === "Invalid pick id") return res.status(400).json({ error: msg });
  if (msg.startsWith("Forbidden:")) return res.status(403).json({ error: msg });
  return res.status(400).json({ error: msg });
}

export const picksController = {
  async listTeams(req: Request, res: Response) {
    try {
      const leagueRaw = Array.isArray(req.query.league) ? req.query.league[0] : req.query.league;
      const league = leagueSchema.parse(leagueRaw);
      const teams = getLeagueTeams(league);
      return res.json({ league, teams });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const { page, limit, search, betType, league, access } = listPicksQuerySchema.parse(req.query);
      const result = await picksService.findPaged({
        page,
        limit,
        search,
        betType,
        league,
        access,
        createdBy: handicapperAuthorId(req),
      });
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const pick = await picksService.findById(pickIdParam(req), handicapperAuthorId(req));
      return res.json({ pick });
    } catch (error) {
      return mapPickError(res, (error as Error).message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const payload = createPickSchema.parse(req.body);
      const adminId = req.admin?._id?.toString();
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const pick = await picksService.create({
        ...payload,
        createdBy: adminId,
      });
      return res.status(201).json({ pick });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const payload = updatePickSchema.parse(req.body);
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }
      const pick = await picksService.updateById(
        pickIdParam(req),
        payload,
        handicapperAuthorId(req)
      );
      return res.json({ pick });
    } catch (error) {
      return mapPickError(res, (error as Error).message);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const result = await picksService.deleteById(
        pickIdParam(req),
        handicapperAuthorId(req)
      );
      return res.json(result);
    } catch (error) {
      return mapPickError(res, (error as Error).message);
    }
  },
};
