import mongoose from "mongoose";
import {
  Tournament,
  type ITournament,
  type TournamentStatus,
  type PrizeType,
} from "../models/Tournament";
import {
  TournamentEntry,
  type ITournamentEntry,
} from "../models/TournamentEntry";
import { Pick } from "../models/Pick";
import { User } from "../models/User";

export type TournamentGame = {
  id: string;
  game: string;
  pickTitle: string;
  league: string;
  awayTeamName?: string;
  homeTeamName?: string;
  odds: string;
  betType: string;
  matchTime?: string;
};

export type TournamentDetailRow = TournamentRow & {
  games: TournamentGame[];
};

export type TournamentRow = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  gameIds: string[];
  prize: { type: PrizeType; value: number; description?: string };
  entries: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type LeaderboardEntry = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  picks: string[];
  score: number;
  rank: number;
  prizeStatus: "unclaimed" | "claimed";
  updatedAt: string;
};

export type CreateTournamentInput = {
  name: string;
  startDate: string;
  endDate: string;
  status?: TournamentStatus;
  gameIds?: string[];
  prize: { type: PrizeType; value: number; description?: string };
  createdBy: string;
};

export type UpdateTournamentInput = {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: TournamentStatus;
  gameIds?: string[];
  prize?: { type: PrizeType; value: number; description?: string };
};

function toRow(t: ITournament, entryCount: number): TournamentRow {
  return {
    id: t._id.toString(),
    name: t.name,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    status: t.status,
    gameIds: t.gameIds.map((id) => id.toString()),
    prize: {
      type: t.prize.type,
      value: t.prize.value,
      description: t.prize.description,
    },
    entries: entryCount,
    createdBy: t.createdBy.toString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

function validateGameIds(ids: string[]): mongoose.Types.ObjectId[] {
  return ids.map((id) => {
    if (!mongoose.isValidObjectId(id)) throw new Error(`Invalid game ID: ${id}`);
    return new mongoose.Types.ObjectId(id);
  });
}

export const tournamentService = {
  async findAll(
    status?: TournamentStatus
  ): Promise<TournamentRow[]> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const tournaments = await Tournament.find(filter).sort({ createdAt: -1 });
    const counts = await TournamentEntry.aggregate([
      {
        $match: {
          tournamentId: { $in: tournaments.map((t) => t._id) },
        },
      },
      { $group: { _id: "$tournamentId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      counts.map((c: { _id: mongoose.Types.ObjectId; count: number }) => [
        c._id.toString(),
        c.count,
      ])
    );

    return tournaments.map((t) =>
      toRow(t, countMap.get(t._id.toString()) ?? 0)
    );
  },

  async findById(id: string): Promise<TournamentRow> {
    if (!mongoose.isValidObjectId(id)) throw new Error("Tournament not found");
    const t = await Tournament.findById(id);
    if (!t) throw new Error("Tournament not found");
    const count = await TournamentEntry.countDocuments({ tournamentId: t._id });
    return toRow(t, count);
  },

  async findByIdWithGames(id: string): Promise<TournamentDetailRow> {
    if (!mongoose.isValidObjectId(id)) throw new Error("Tournament not found");
    const t = await Tournament.findById(id);
    if (!t) throw new Error("Tournament not found");
    const count = await TournamentEntry.countDocuments({ tournamentId: t._id });

    // Only fetch picks that are labeled as "tournament" access
    const picks = await Pick.find({
      _id: { $in: t.gameIds },
      access: "tournament"
    }).select(
      "game pickTitle league awayTeamName homeTeamName odds betType matchTime"
    );

    const games: TournamentGame[] = picks.map((p) => ({
      id: p._id.toString(),
      game: p.game,
      pickTitle: p.pickTitle,
      league: p.league,
      awayTeamName: p.awayTeamName,
      homeTeamName: p.homeTeamName,
      odds: p.odds,
      betType: p.betType,
      matchTime: p.matchTime?.toISOString(),
    }));

    return { ...toRow(t, count), games };
  },

  async create(input: CreateTournamentInput): Promise<TournamentRow> {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (Number.isNaN(start.getTime())) throw new Error("Invalid start date");
    if (Number.isNaN(end.getTime())) throw new Error("Invalid end date");
    if (end <= start) throw new Error("End date must be after start date");

    const gameIds = input.gameIds ? validateGameIds(input.gameIds) : [];

    const t = await Tournament.create({
      name: input.name,
      startDate: start,
      endDate: end,
      status: input.status ?? "inactive",
      gameIds,
      prize: input.prize,
      createdBy: new mongoose.Types.ObjectId(input.createdBy),
    });

    return toRow(t, 0);
  },

  async updateById(
    id: string,
    input: UpdateTournamentInput
  ): Promise<TournamentRow> {
    if (!mongoose.isValidObjectId(id)) throw new Error("Tournament not found");

    const update: Record<string, unknown> = {};
    if (input.name !== undefined) update.name = input.name;
    if (input.status !== undefined) update.status = input.status;
    if (input.prize !== undefined) update.prize = input.prize;

    if (input.startDate !== undefined) {
      const d = new Date(input.startDate);
      if (Number.isNaN(d.getTime())) throw new Error("Invalid start date");
      update.startDate = d;
    }
    if (input.endDate !== undefined) {
      const d = new Date(input.endDate);
      if (Number.isNaN(d.getTime())) throw new Error("Invalid end date");
      update.endDate = d;
    }
    if (input.gameIds !== undefined) {
      update.gameIds = validateGameIds(input.gameIds);
    }

    const t = await Tournament.findByIdAndUpdate(id, update, { new: true });
    if (!t) throw new Error("Tournament not found");

    const count = await TournamentEntry.countDocuments({ tournamentId: t._id });
    return toRow(t, count);
  },

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    if (!mongoose.isValidObjectId(id)) throw new Error("Tournament not found");
    const t = await Tournament.findByIdAndDelete(id);
    if (!t) throw new Error("Tournament not found");
    await TournamentEntry.deleteMany({ tournamentId: t._id });
    return { deleted: true };
  },

  async getLeaderboard(id: string): Promise<LeaderboardEntry[]> {
    if (!mongoose.isValidObjectId(id)) throw new Error("Tournament not found");
    const t = await Tournament.findById(id);
    if (!t) throw new Error("Tournament not found");

    const entries = await TournamentEntry.find({ tournamentId: t._id });

    const allPickIds = [...new Set(entries.flatMap((e) => e.picks.map((p) => p.toString())))];
    const wonPicks = await Pick.find({
      _id: { $in: allPickIds.map((id) => new mongoose.Types.ObjectId(id)) },
      result: "won",
    }).select("_id");
    const wonSet = new Set(wonPicks.map((p) => p._id.toString()));

    for (const entry of entries) {
      const newScore = entry.picks.filter((p) => wonSet.has(p.toString())).length;
      if (entry.score !== newScore) {
        entry.score = newScore;
        await entry.save();
      }
    }

    entries.sort((a, b) => b.score - a.score || a.createdAt.getTime() - b.createdAt.getTime());

    const memberIds = entries.map((e) => e.memberId);
    const users = await User.find({ _id: { $in: memberIds } }).select(
      "name email"
    );
    const userMap = new Map(
      users.map((u) => [u._id.toString(), { name: u.name, email: u.email }])
    );

    return entries.map((e, i) => {
      const user = userMap.get(e.memberId.toString());
      return {
        id: e._id.toString(),
        memberId: e.memberId.toString(),
        memberName: user?.name ?? "Unknown",
        memberEmail: user?.email ?? "",
        picks: e.picks.map((p) => p.toString()),
        score: e.score,
        rank: i + 1,
        prizeStatus: e.prizeStatus,
        updatedAt: e.updatedAt.toISOString(),
      };
    });
  },

  async addEntry(
    tournamentId: string,
    memberId: string
  ): Promise<ITournamentEntry> {
    if (!mongoose.isValidObjectId(tournamentId))
      throw new Error("Tournament not found");
    if (!mongoose.isValidObjectId(memberId))
      throw new Error("Invalid member ID");

    const t = await Tournament.findById(tournamentId);
    if (!t) throw new Error("Tournament not found");
    if (t.status !== "active")
      throw new Error("Tournament is not active");

    const existing = await TournamentEntry.findOne({
      tournamentId: t._id,
      memberId: new mongoose.Types.ObjectId(memberId),
    });
    if (existing) throw new Error("Member already entered this tournament");

    return TournamentEntry.create({
      tournamentId: t._id,
      memberId: new mongoose.Types.ObjectId(memberId),
      picks: [],
      score: 0,
      rank: 0,
    });
  },

  async updateEntryPicks(
    tournamentId: string,
    entryId: string,
    picks: string[]
  ): Promise<ITournamentEntry> {
    if (!mongoose.isValidObjectId(entryId))
      throw new Error("Entry not found");

    const entry = await TournamentEntry.findOne({
      _id: entryId,
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
    });
    if (!entry) throw new Error("Entry not found");

    entry.picks = validateGameIds(picks);
    const wonPicks = await Pick.find({
      _id: { $in: entry.picks },
      result: "won",
    }).select("_id");
    entry.score = wonPicks.length;
    await entry.save();
    return entry;
  },

  async markPrizeClaimed(
    tournamentId: string,
    memberId: string
  ): Promise<{ success: boolean }> {
    if (!mongoose.isValidObjectId(tournamentId))
      throw new Error("Tournament not found");
    if (!mongoose.isValidObjectId(memberId))
      throw new Error("Invalid member ID");

    const entry = await TournamentEntry.findOne({
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
      memberId: new mongoose.Types.ObjectId(memberId),
    });
    if (!entry) throw new Error("Entry not found");

    entry.prizeStatus = "claimed";
    await entry.save();
    return { success: true };
  },

  async findActiveTournaments(): Promise<TournamentRow[]> {
    const tournaments = await Tournament.find({
      status: { $in: ["active", "completed"] },
    }).sort({ createdAt: -1 });

    const counts = await TournamentEntry.aggregate([
      {
        $match: {
          tournamentId: { $in: tournaments.map((t) => t._id) },
        },
      },
      { $group: { _id: "$tournamentId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      counts.map((c: { _id: mongoose.Types.ObjectId; count: number }) => [
        c._id.toString(),
        c.count,
      ])
    );

    return tournaments.map((t) =>
      toRow(t, countMap.get(t._id.toString()) ?? 0)
    );
  },

  async findMyEntry(
    tournamentId: string,
    memberId: string
  ): Promise<{
    id: string;
    tournamentId: string;
    picks: string[];
    score: number;
    rank: number;
    prizeStatus: "unclaimed" | "claimed";
    createdAt: string;
    updatedAt: string;
  } | null> {
    if (!mongoose.isValidObjectId(tournamentId)) return null;
    if (!mongoose.isValidObjectId(memberId)) return null;

    const entry = await TournamentEntry.findOne({
      tournamentId: new mongoose.Types.ObjectId(tournamentId),
      memberId: new mongoose.Types.ObjectId(memberId),
    });
    if (!entry) return null;

    return {
      id: entry._id.toString(),
      tournamentId: entry.tournamentId.toString(),
      picks: entry.picks.map((p) => p.toString()),
      score: entry.score,
      rank: entry.rank,
      prizeStatus: entry.prizeStatus,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  },

  async findMyEntries(memberId: string): Promise<
    Array<{
      id: string;
      tournamentId: string;
      picks: string[];
      score: number;
      rank: number;
      prizeStatus: "unclaimed" | "claimed";
      createdAt: string;
      updatedAt: string;
      tournament: TournamentRow | null;
    }>
  > {
    if (!mongoose.isValidObjectId(memberId)) return [];

    const entries = await TournamentEntry.find({
      memberId: new mongoose.Types.ObjectId(memberId),
    }).sort({ createdAt: -1 });

    const tournamentIds = [...new Set(entries.map((e) => e.tournamentId.toString()))];
    const tournaments = await Tournament.find({
      _id: { $in: tournamentIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    const entryCounts = await TournamentEntry.aggregate([
      {
        $match: {
          tournamentId: { $in: tournaments.map((t) => t._id) },
        },
      },
      { $group: { _id: "$tournamentId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      entryCounts.map((c: { _id: mongoose.Types.ObjectId; count: number }) => [
        c._id.toString(),
        c.count,
      ])
    );
    const tMap = new Map(
      tournaments.map((t) => [
        t._id.toString(),
        toRow(t, countMap.get(t._id.toString()) ?? 0),
      ])
    );

    return entries.map((e) => ({
      id: e._id.toString(),
      tournamentId: e.tournamentId.toString(),
      picks: e.picks.map((p) => p.toString()),
      score: e.score,
      rank: e.rank,
      prizeStatus: e.prizeStatus,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      tournament: tMap.get(e.tournamentId.toString()) ?? null,
    }));
  },

  async submitMyPicks(
    tournamentId: string,
    memberId: string,
    picks: string[]
  ): Promise<{
    id: string;
    picks: string[];
    score: number;
    rank: number;
  }> {
    if (!mongoose.isValidObjectId(tournamentId))
      throw new Error("Tournament not found");
    if (!mongoose.isValidObjectId(memberId))
      throw new Error("Invalid member ID");

    const t = await Tournament.findById(tournamentId);
    if (!t) throw new Error("Tournament not found");
    if (t.status !== "active")
      throw new Error("Tournament is not active");

    const allowedIds = new Set(t.gameIds.map((id) => id.toString()));
    for (const pickId of picks) {
      if (!mongoose.isValidObjectId(pickId))
        throw new Error(`Invalid pick ID: ${pickId}`);
      if (!allowedIds.has(pickId))
        throw new Error("One or more picks are not part of this tournament");
    }

    const entry = await TournamentEntry.findOne({
      tournamentId: t._id,
      memberId: new mongoose.Types.ObjectId(memberId),
    });
    if (!entry) throw new Error("You must join the tournament first");

    entry.picks = picks.map((id) => new mongoose.Types.ObjectId(id));
    const wonPicks = await Pick.find({
      _id: { $in: entry.picks },
      result: "won",
    }).select("_id");
    entry.score = wonPicks.length;
    await entry.save();

    return {
      id: entry._id.toString(),
      picks: entry.picks.map((p) => p.toString()),
      score: entry.score,
      rank: entry.rank,
    };
  },
};
