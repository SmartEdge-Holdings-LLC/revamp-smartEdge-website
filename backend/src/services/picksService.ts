import mongoose from "mongoose";
import {
  findLeagueTeam,
  formatMatchupGame,
  hydratePickMatchup,
} from "../config/leagueTeams";
import { isBetTypeAllowedForLeague } from "../config/pickBetTypes";
import type { AdminRole } from "../models/Admin";
import { TournamentEntry } from "../models/TournamentEntry";
import {
  BET_TYPES,
  Pick,
  type BetType,
  type IPick,
  type League,
  type PickAccess,
  type PickResult,
  type PickStatus,
} from "../models/Pick";

const PUBLIC_AUTHOR_ROLES: readonly AdminRole[] = ["admin", "subadmin", "handicapper"];

export type PublicPickSource = "smartedge" | "handicapper";

/** Member paid-pick feeds: SmartEdge desk vs Jonah handicapper. */
export type PaidPickSource = "admin" | "jonah";

const SMARTEDGE_AUTHOR_ROLES: AdminRole[] = ["admin", "subadmin"];
const HANDICAPPER_AUTHOR_ROLES: AdminRole[] = ["handicapper"];

export type PickCreateInput = {
  league: League;
  useCustomMatchup?: boolean;
  awayTeamId?: string;
  homeTeamId?: string;
  awayTeamName?: string;
  homeTeamName?: string;
  game?: string;
  pickTitle: string;
  detailedAnalysis?: string;
  odds?: string;
  betType: BetType;
  confidence?: number;
  access: PickAccess;
  status: PickStatus;
  matchTime?: string;
  isPickOfDay?: boolean;
  createdBy: string;
};

export type PickUpdateInput = Partial<Omit<PickCreateInput, "createdBy">> & {
  result?: PickResult;
};

export type PickListOptions = {
  page: number;
  limit: number;
  search?: string;
  betType?: BetType[];
  league?: League[];
  access?: PickAccess[];
  status?: PickStatus[];
  /** When set, only picks created by this admin/handicapper id are returned. */
  createdBy?: string;
};

export type PublicPickAuthor = {
  name: string;
  role: AdminRole;
};

/** Pick fields exposed on `GET /api/picks` (free, active only). */
export type PublicPickDto = {
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
  detailedAnalysis?: string;
  odds?: string;
  betType: BetType;
  confidence?: number;
  access: "free";
  status: "active";
  matchTime?: Date;
  isPickOfDay?: boolean;
  createdBy?: PublicPickAuthor;
  createdAt: Date;
  updatedAt: Date;
};

/** Pick fields exposed on paid member APIs (`GET /api/picks/paid/*`). */
export type PaidPickDto = Omit<PublicPickDto, "access"> & {
  access: "smartedgeVIPPremium";
};

function parsePickAuthor(rawAuthor: unknown): PublicPickAuthor | undefined {
  if (!rawAuthor || typeof rawAuthor !== "object" || !("name" in rawAuthor)) return undefined;
  const name = String((rawAuthor as { name: unknown }).name).trim();
  const roleRaw = (rawAuthor as { role?: unknown }).role;
  const role =
    typeof roleRaw === "string" &&
    (PUBLIC_AUTHOR_ROLES as readonly string[]).includes(roleRaw)
      ? (roleRaw as AdminRole)
      : undefined;
  if (!name || !role) return undefined;
  return { name, role };
}

function toMemberPick(
  pick: Record<string, unknown>,
  access: "free" | "smartedgeVIPPremium"
): PublicPickDto | PaidPickDto {
  const hydrated = hydratePickMatchup(pick as unknown as any) as Record<string, unknown>;
  const createdBy = parsePickAuthor(hydrated.createdBy);

  const base = {
    _id: String(hydrated._id),
    league: hydrated.league as League,
    awayTeamId: hydrated.awayTeamId as string | undefined,
    homeTeamId: hydrated.homeTeamId as string | undefined,
    awayTeamName: hydrated.awayTeamName as string | undefined,
    homeTeamName: hydrated.homeTeamName as string | undefined,
    awayTeamLogo: hydrated.awayTeamLogo as string | undefined,
    homeTeamLogo: hydrated.homeTeamLogo as string | undefined,
    game: String(hydrated.game),
    pickTitle: String(hydrated.pickTitle),
    detailedAnalysis: String(hydrated.detailedAnalysis),
    odds: String(hydrated.odds),
    betType: hydrated.betType as BetType,
    confidence: hydrated.confidence ? Number(hydrated.confidence) : undefined,
    access,
    status: "active" as const,
    matchTime: hydrated.matchTime as Date | undefined,
    isPickOfDay: hydrated.isPickOfDay as boolean | undefined,
    createdBy,
    createdAt: hydrated.createdAt as Date,
    updatedAt: hydrated.updatedAt as Date,
  };

  return access === "free" ? (base as PublicPickDto) : (base as PaidPickDto);
}

function toPublicPick(pick: Record<string, unknown>): PublicPickDto {
  return toMemberPick(pick, "free") as PublicPickDto;
}

function toPaidPick(pick: Record<string, unknown>): PaidPickDto {
  const hydrated = hydratePickMatchup(pick as unknown as any) as Record<string, unknown>;
  const createdBy = parsePickAuthor(hydrated.createdBy);

  return {
    _id: String(hydrated._id),
    league: hydrated.league as League,
    awayTeamId: hydrated.awayTeamId as string | undefined,
    homeTeamId: hydrated.homeTeamId as string | undefined,
    awayTeamName: hydrated.awayTeamName as string | undefined,
    homeTeamName: hydrated.homeTeamName as string | undefined,
    awayTeamLogo: hydrated.awayTeamLogo as string | undefined,
    homeTeamLogo: hydrated.homeTeamLogo as string | undefined,
    game: String(hydrated.game),
    pickTitle: String(hydrated.pickTitle),
    detailedAnalysis: String(hydrated.detailedAnalysis),
    odds: String(hydrated.odds),
    betType: hydrated.betType as BetType,
    confidence: hydrated.confidence ? Number(hydrated.confidence) : undefined,
    access: hydrated.access as PickAccess,
    status: "active" as const,
    matchTime: hydrated.matchTime as Date | undefined,
    isPickOfDay: hydrated.isPickOfDay as boolean | undefined,
    createdBy,
    createdAt: hydrated.createdAt as Date,
    updatedAt: hydrated.updatedAt as Date,
  } as PaidPickDto;
}

function authorRolesForPaidSource(source: PaidPickSource): AdminRole[] {
  return source === "jonah" ? HANDICAPPER_AUTHOR_ROLES : SMARTEDGE_AUTHOR_ROLES;
}

async function findActivePagedByAuthorSource(options: {
  page: number;
  limit: number;
  search?: string;
  league?: League[];
  access: PickAccess | PickAccess[];
  authorRoles: AdminRole[];
}) {
  const { page, limit, search, league, access, authorRoles } = options;
  const skip = (page - 1) * limit;

  const match: Record<string, unknown> = {
    access: Array.isArray(access) ? { $in: access } : access,
    status: "active",
  };
  if (league && league.length > 0) {
    match.league = { $in: league };
  }
  const trimmed = search?.trim();
  if (trimmed) {
    const escaped = escapeRegex(trimmed);
    match.$or = [
      { game: { $regex: escaped, $options: "i" } },
      { awayTeamName: { $regex: escaped, $options: "i" } },
      { homeTeamName: { $regex: escaped, $options: "i" } },
      { pickTitle: { $regex: escaped, $options: "i" } },
      { detailedAnalysis: { $regex: escaped, $options: "i" } },
    ];
  }

  const facetResult = await Pick.aggregate<{
    data: Record<string, unknown>[];
    total: { count: number }[];
  }>([
    { $match: match },
    {
      $lookup: {
        from: "admins",
        localField: "createdBy",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    { $match: { "author.role": { $in: authorRoles } } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]);

  const rows = facetResult[0]?.data ?? [];
  const total = facetResult[0]?.total[0]?.count ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return { rows, page, limit, total, totalPages };
}

function rowToHydratedPick(row: Record<string, unknown>): Record<string, unknown> {
  const authorDoc = row.author as { name?: string; role?: string } | undefined;
  const { author: _author, ...pickDoc } = row;
  const withAuthor = {
    ...pickDoc,
    createdBy: authorDoc
      ? { name: authorDoc.name, email: "", role: authorDoc.role }
      : undefined,
  };
  return hydratePickMatchup(withAuthor as unknown as any) as Record<string, unknown>;
}

function mapRowsToPublicPicks(rows: Record<string, unknown>[]): PublicPickDto[] {
  return rows.map((row) => toPublicPick(rowToHydratedPick(row)));
}

function mapRowsToPaidPicks(rows: Record<string, unknown>[]): PaidPickDto[] {
  return rows.map((row) => toPaidPick(rowToHydratedPick(row)));
}

const CREATED_BY_FIELDS = "name email role";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickCreatorId(pick: { createdBy?: unknown }): string | null {
  const cb = pick.createdBy;
  if (!cb) return null;
  if (typeof cb === "object" && cb !== null && "_id" in cb) {
    return String((cb as { _id: unknown })._id);
  }
  return String(cb);
}

function assertPickAuthor(pick: { createdBy?: unknown }, authorId: string) {
  if (pickCreatorId(pick) !== authorId) {
    throw new Error("Forbidden: you can only access your own picks");
  }
}

function slugFromTeamName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return slug || "team";
}

function resolveMatchup(league: League, awayTeamId: string, homeTeamId: string) {
  const awayId = awayTeamId.trim().toLowerCase();
  const homeId = homeTeamId.trim().toLowerCase();
  if (!awayId || !homeId) throw new Error("Away and home team are required");
  if (awayId === homeId) throw new Error("Away and home team must be different");
  const away = findLeagueTeam(league, awayId);
  const home = findLeagueTeam(league, homeId);
  if (!away || !home) throw new Error("Invalid team selection for this league");
  return {
    awayTeamId: away.id,
    homeTeamId: home.id,
    awayTeamName: away.shortName,
    homeTeamName: home.shortName,
    awayTeamLogo: away.logo,
    homeTeamLogo: home.logo,
    game: formatMatchupGame(away, home),
  };
}

function resolveCustomMatchup(awayTeamName: string, homeTeamName: string, game?: string) {
  const away = awayTeamName.trim();
  const home = homeTeamName.trim();
  if (!away || !home) throw new Error("Away and home names are required for a custom matchup");
  if (away.toLowerCase() === home.toLowerCase()) {
    throw new Error("Away and home must be different");
  }
  const awaySlug = slugFromTeamName(away);
  const homeSlug = slugFromTeamName(home);
  if (awaySlug === homeSlug) throw new Error("Away and home must be different");
  const gameLabel = (game?.trim() || `${away} @ ${home}`).slice(0, 500);
  return {
    awayTeamId: awaySlug,
    homeTeamId: homeSlug,
    awayTeamName: away.slice(0, 120),
    homeTeamName: home.slice(0, 120),
    awayTeamLogo: undefined as string | undefined,
    homeTeamLogo: undefined as string | undefined,
    game: gameLabel,
  };
}

export type MatchupInput = {
  league: League;
  useCustomMatchup?: boolean;
  awayTeamId?: string;
  homeTeamId?: string;
  awayTeamName?: string;
  homeTeamName?: string;
  game?: string;
};

function resolveMatchupFromInput(input: MatchupInput) {
  const useCustom = input.useCustomMatchup === true;
  const awayName = input.awayTeamName?.trim() ?? "";
  const homeName = input.homeTeamName?.trim() ?? "";
  const awayId = input.awayTeamId?.trim() ?? "";
  const homeId = input.homeTeamId?.trim() ?? "";

  if (useCustom || (!awayId && !homeId && awayName && homeName)) {
    return resolveCustomMatchup(awayName, homeName, input.game);
  }

  if (awayId && homeId) {
    try {
      return resolveMatchup(input.league, awayId, homeId);
    } catch (err) {
      if (awayName && homeName) {
        return resolveCustomMatchup(awayName, homeName, input.game);
      }
      throw err;
    }
  }

  if (awayName && homeName) {
    return resolveCustomMatchup(awayName, homeName, input.game);
  }

  throw new Error("Select teams from the list or enter a custom matchup");
}

export const picksService = {
  async create(input: PickCreateInput) {
    if (!mongoose.Types.ObjectId.isValid(input.createdBy)) {
      throw new Error("Invalid admin id");
    }
    if (!isBetTypeAllowedForLeague(input.league, input.betType)) {
      throw new Error(`Bet type "${input.betType}" is not valid for league ${input.league}`);
    }
    const matchup = resolveMatchupFromInput(input);
    const pick = await Pick.create({
      league: input.league,
      ...matchup,
      pickTitle: input.pickTitle.trim(),
      detailedAnalysis: input.detailedAnalysis?.trim(),
      odds: input.odds?.trim(),
      betType: input.betType,
      confidence: input.confidence,
      access: input.access,
      status: input.status,
      matchTime: input.matchTime ? new Date(input.matchTime) : undefined,
      isPickOfDay: input.isPickOfDay,
      createdBy: input.createdBy,
    });
    return this.findById(pick._id.toString());
  },

  async findPublicFreePaged(options: {
    page?: number;
    limit?: number;
    search?: string;
    league?: League[];
    source?: PublicPickSource;
  }) {
    let page = options.page ?? 1;
    if (!Number.isFinite(page) || page < 1) page = 1;
    let limit = options.limit ?? 20;
    if (!Number.isFinite(limit) || limit < 1) limit = 20;
    limit = Math.min(50, limit);

    if (options.source) {
      return this.findPublicFreePagedBySource({
        page,
        limit,
        search: options.search,
        league: options.league,
        source: options.source,
      });
    }

    const result = await this.findPaged({
      page,
      limit,
      search: options.search,
      league: options.league,
      access: ["free", "both"],
      status: ["active"],
    });

    return {
      picks: result.picks.map((p) => toPublicPick(p as unknown as Record<string, unknown>)),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  },

  async findPublicFreePagedBySource(options: {
    page: number;
    limit: number;
    search?: string;
    league?: League[];
    source: PublicPickSource;
  }) {
    const { page, limit, search, league, source } = options;
    const roles =
      source === "handicapper" ? HANDICAPPER_AUTHOR_ROLES : SMARTEDGE_AUTHOR_ROLES;

    const { rows, total, totalPages } = await findActivePagedByAuthorSource({
      page,
      limit,
      search,
      league,
      access: ["free", "both"],
      authorRoles: roles,
    });

    const picks = mapRowsToPublicPicks(rows);

    return { picks, page, limit, total, totalPages, source };
  },

  async findPaidPagedBySource(options: {
    page: number;
    limit: number;
    search?: string;
    league?: League[];
    access?: string[];
    source: PaidPickSource;
  }) {
    const { page, limit, search, league, access, source } = options;
    const roles = authorRolesForPaidSource(source);

    // Use provided access filter or default to free and tournament
    const accessFilter = access && access.length > 0
      ? (access as ["free" | "smartedgeVIP" | "smartedgeVIPPremium" | "tournament", ...("free" | "smartedgeVIP" | "smartedgeVIPPremium" | "tournament")[]])
      : (["free", "tournament"] as const);

    const { rows, total, totalPages } = await findActivePagedByAuthorSource({
      page,
      limit,
      search,
      league,
      access: accessFilter,
      authorRoles: roles,
    });

    const picks = mapRowsToPaidPicks(rows);

    return { picks, page, limit, total, totalPages, source };
  },

  async findPublicFreeById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid pick id");
    }
    const pick = await Pick.findOne({
      _id: id,
      access: { $in: ["free", "both"] },
      status: "active",
    })
      .populate("createdBy", CREATED_BY_FIELDS)
      .lean();
    if (!pick) throw new Error("Pick not found");
    return toPublicPick(pick as unknown as Record<string, unknown>);
  },

  async findById(id: string, authorId?: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid pick id");
    }
    const pick = await Pick.findById(id)
      .populate("createdBy", CREATED_BY_FIELDS)
      .lean();
    if (!pick) throw new Error("Pick not found");
    if (authorId) assertPickAuthor(pick, authorId);
    return hydratePickMatchup(pick);
  },

  async findPaged(options: PickListOptions) {
    const { page, limit, search, betType, league, createdBy, access, status } = options;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    const trimmed = search?.trim();
    if (trimmed) {
      const escaped = escapeRegex(trimmed);
      filter.$or = [
        { game: { $regex: escaped, $options: "i" } },
        { awayTeamName: { $regex: escaped, $options: "i" } },
        { homeTeamName: { $regex: escaped, $options: "i" } },
        { pickTitle: { $regex: escaped, $options: "i" } },
        { detailedAnalysis: { $regex: escaped, $options: "i" } },
      ];
    }
    if (betType && betType.length > 0) {
      filter.betType = { $in: betType };
    }
    if (league && league.length > 0) {
      filter.league = { $in: league };
    }
    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      filter.createdBy = createdBy;
    }
    if (access && access.length > 0) {
      filter.access = { $in: access };
    }
    if (status && status.length > 0) {
      filter.status = { $in: status };
    }

    const [picks, total] = await Promise.all([
      Pick.find(filter)
        .sort({ createdAt: -1 })
        .populate("createdBy", CREATED_BY_FIELDS)
        .skip(skip)
        .limit(limit)
        .lean(),
      Pick.countDocuments(filter),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
    return {
      picks: picks.map((p) => hydratePickMatchup(p)),
      page,
      limit,
      total,
      totalPages,
    };
  },

  async updateById(id: string, input: PickUpdateInput, authorId?: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid pick id");
    }
    const existing = await Pick.findById(id).lean();
    if (!existing) throw new Error("Pick not found");
    if (authorId) assertPickAuthor(existing, authorId);

    const update: Partial<IPick> = {};
    const league = (input.league ?? existing.league) as League;

    const matchupFieldsTouched =
      input.useCustomMatchup !== undefined ||
      input.awayTeamId !== undefined ||
      input.homeTeamId !== undefined ||
      input.awayTeamName !== undefined ||
      input.homeTeamName !== undefined ||
      input.game !== undefined;

    if (matchupFieldsTouched) {
      const matchup = resolveMatchupFromInput({
        league,
        useCustomMatchup: input.useCustomMatchup,
        awayTeamId: input.awayTeamId ?? existing.awayTeamId,
        homeTeamId: input.homeTeamId ?? existing.homeTeamId,
        awayTeamName: input.awayTeamName ?? existing.awayTeamName,
        homeTeamName: input.homeTeamName ?? existing.homeTeamName,
        game: input.game ?? existing.game,
      });
      if (input.league !== undefined) update.league = input.league;
      update.awayTeamId = matchup.awayTeamId;
      update.homeTeamId = matchup.homeTeamId;
      update.awayTeamName = matchup.awayTeamName;
      update.homeTeamName = matchup.homeTeamName;
      update.awayTeamLogo = matchup.awayTeamLogo;
      update.homeTeamLogo = matchup.homeTeamLogo;
      update.game = matchup.game;
    } else if (input.league !== undefined) {
      update.league = input.league;
    }
    if (input.pickTitle !== undefined) update.pickTitle = input.pickTitle.trim();
    if (input.detailedAnalysis !== undefined) {
      update.detailedAnalysis = input.detailedAnalysis.trim() || undefined;
    }
    if (input.odds !== undefined) {
      update.odds = input.odds.trim() || undefined;
    }
    const nextBetType = input.betType ?? existing.betType;
    if (!isBetTypeAllowedForLeague(league, nextBetType)) {
      throw new Error(`Bet type "${nextBetType}" is not valid for league ${league}`);
    }
    if (input.betType !== undefined) update.betType = input.betType;
    if (input.confidence !== undefined) update.confidence = input.confidence;
    if (input.access !== undefined) update.access = input.access;
    if (input.status !== undefined) update.status = input.status;
    if (input.matchTime !== undefined) {
      update.matchTime = input.matchTime ? new Date(input.matchTime) : undefined;
    }
    if (input.isPickOfDay !== undefined) update.isPickOfDay = input.isPickOfDay;
    if (input.result !== undefined) update.result = input.result;

    const pick = await Pick.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!pick) throw new Error("Pick not found");

    if (input.result !== undefined) {
      await this.recalcTournamentScoresForPick(id);
    }

    return this.findById(id);
  },

  async deleteById(id: string, authorId?: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid pick id");
    }
    if (authorId) {
      const existing = await Pick.findById(id).lean();
      if (!existing) throw new Error("Pick not found");
      assertPickAuthor(existing, authorId);
    }
    const result = await Pick.findByIdAndDelete(id);
    if (!result) throw new Error("Pick not found");
    return { deleted: true as const };
  },

  allowedBetTypes(): readonly BetType[] {
    return BET_TYPES;
  },

  async recalcTournamentScoresForPick(pickId: string): Promise<void> {
    const entries = await TournamentEntry.find({
      picks: new mongoose.Types.ObjectId(pickId),
    });
    if (entries.length === 0) return;

    for (const entry of entries) {
      const wonPicks = await Pick.find({
        _id: { $in: entry.picks },
        result: "won",
      }).select("_id");
      const newScore = wonPicks.length;
      if (entry.score !== newScore) {
        entry.score = newScore;
        await entry.save();
      }
    }
  },
};
