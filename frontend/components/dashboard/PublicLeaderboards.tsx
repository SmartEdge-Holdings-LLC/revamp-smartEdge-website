"use client";

import * as React from "react";
import Image from "next/image";
import { Crown, Swords, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  getTournamentLeaderboard,
  listActiveTournaments,
  type LeaderboardEntry,
  type Tournament,
} from "@/lib/api/tournamentApi";
import { cn } from "@/lib/utils";

interface PublicLeaderboardsProps {
  token: string;
  currentUserId: string;
}

function TopThreeCard({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  const initials = entry.memberName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const rankConfigs = {
    1: {
      borderColor: "border-amber-500/50",
      bgColor: "bg-linear-to-bl from-transparent via-amber-400/50 to-transparent",
      textColor: "text-white",
      badgeColor: "bg-amber-500/40 border border-amber-400/60",
      avatarBg: "bg-amber-500/30 border border-amber-400/50"
    },
    2: {
      borderColor: "border-white/30",
      bgColor: "bg-linear-to-bl from-transparent via-white/50 to-transparent",
      textColor: "text-white",
      badgeColor: "bg-white/40 border border-white/60",
      avatarBg: "bg-white/30 border border-white/50"
    },
    3: {
      borderColor: "border-orange-400/50",
      bgColor: "bg-linear-to-bl from-transparent via-orange-300/50 to-transparent",
      textColor: "text-white",
      badgeColor: "bg-orange-400/40 border border-orange-300/60",
      avatarBg: "bg-orange-400/30 border border-orange-300/50"
    }
  };

  const config = rankConfigs[rank as keyof typeof rankConfigs];

  return (
    <div className={cn(
      "relative rounded-2xl border p-8 transition-all hover:shadow-lg",
      config.borderColor,
      config.bgColor
    )}>
      {/* Prize Icon */}
      <div className="absolute right-6 top-6">
        <Image
          src={`/icons/prize${rank}.svg`}
          alt={`Prize ${rank}`}
          width={48}
          height={48}
          className="drop-shadow-lg"
        />
      </div>

      {/* Avatar and Name */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className={cn(
          "mb-4 flex size-16 items-center justify-center rounded-full font-bold text-2xl text-white",
          config.avatarBg
        )}>
          {initials}
        </div>
        <h3 className="text-xl font-semibold text-white">{entry.memberName}</h3>
        <p className={cn("mt-1 text-sm", config.textColor)}>
          Rank #{rank}
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-t border-white/10 py-3">
          <p className="text-sm text-zinc-400">Points</p>
          <p className="text-2xl font-bold text-white">{entry.score}</p>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 py-3">
          <p className="text-sm text-zinc-400">Picks</p>
          <p className="text-2xl font-bold text-white">{entry.picks.length}</p>
        </div>
      </div>
    </div>
  );
}

function RankedListRow({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  const initials = entry.memberName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-4 transition-all hover:bg-white/8">
      {/* Rank */}
      <div className="w-8 text-center font-bold text-white">
        {rank}
      </div>

      {/* Avatar */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
        {initials}
      </div>

      {/* Name & Email */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">
          {entry.memberName}
        </p>
        <p className="text-xs text-zinc-500">
          {entry.picks.length} picks
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 text-right">
        <div>
          <p className="text-xs text-zinc-500">Picks</p>
          <p className="text-sm font-bold text-white">{entry.picks.length}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Points</p>
          <p className="text-sm font-bold text-white">{entry.score}</p>
        </div>
      </div>
    </div>
  );
}

function TournamentLeaderboard({
  tournament,
  entries,
  loading,
}: {
  tournament: Tournament;
  entries: LeaderboardEntry[];
  loading: boolean;
}) {

  const topThree = entries.slice(0, 3);
  const restOfEntries = entries.slice(3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <h2 className="text-3xl font-bold text-white">
        {tournament.name}
      </h2>

      {/* Prize Box */}
      <div className="pricing-accent-gradient rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-white/20">
              <Trophy className="size-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {tournament.prize.type === "discount"
                  ? `${tournament.prize.value}% Discount`
                  : tournament.prize.type === "freeMonth"
                    ? `${tournament.prize.value} Free Month${tournament.prize.value !== 1 ? "s" : ""}`
                    : tournament.prize.description || `$${tournament.prize.value}`}
              </p>
              <p className="mt-1 text-sm text-white/80">
                Ends {new Date(tournament.endDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })} • Top {Math.min(tournament.entries, 10)} win
              </p>
            </div>
          </div>
          <Badge className="rounded-lg border-transparent bg-white/20 px-4 py-2 font-semibold text-white">
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl bg-white/4" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg bg-white/4" />
            ))}
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Swords className="size-12 text-zinc-600" strokeWidth={1.5} />
          <p className="text-sm text-zinc-500">No entries yet</p>
        </div>
      ) : (
        <>
          {/* Top 3 Cards */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-3 gap-6">
              {/* 2nd Place */}
              {topThree[1] && (
                <TopThreeCard entry={topThree[1]} rank={2} />
              )}

              {/* 1st Place (Center) */}
              {topThree[0] && (
                <TopThreeCard entry={topThree[0]} rank={1} />
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <TopThreeCard entry={topThree[2]} rank={3} />
              )}
            </div>
          )}

          {/* Rest of the World */}
          {restOfEntries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Rest of the world
              </h3>
              <div className="space-y-2">
                {restOfEntries.map((entry, idx) => (
                  <RankedListRow
                    key={entry.id}
                    entry={entry}
                    rank={idx + 4}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function PublicLeaderboards({
  token,
  currentUserId,
}: PublicLeaderboardsProps) {
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [leaderboards, setLeaderboards] = React.useState<
    Record<string, LeaderboardEntry[]>
  >({});
  const [loading, setLoading] = React.useState(true);
  const [loadingTournaments, setLoadingTournaments] = React.useState<
    Record<string, boolean>
  >({});

  const fetchTournaments = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await listActiveTournaments(token);
      setTournaments(res.tournaments);

      res.tournaments.forEach((t) => {
        fetchLeaderboard(t.id);
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchLeaderboard = async (tournamentId: string) => {
    setLoadingTournaments((prev) => ({ ...prev, [tournamentId]: true }));
    try {
      const res = await getTournamentLeaderboard(token, tournamentId);
      setLeaderboards((prev) => ({
        ...prev,
        [tournamentId]: res.entries,
      }));
    } catch {
      setLeaderboards((prev) => ({
        ...prev,
        [tournamentId]: [],
      }));
    } finally {
      setLoadingTournaments((prev) => ({ ...prev, [tournamentId]: false }));
    }
  };

  React.useEffect(() => {
    void fetchTournaments();
  }, [fetchTournaments]);

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="mt-12 w-full max-w-6xl space-y-6 px-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-lg bg-white/4" />
          ))}
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <Swords className="size-7 text-zinc-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              No active tournaments
            </p>
            <p className="mt-1 max-w-sm text-xs text-zinc-600">
              Check back soon — tournament leaderboards will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="mt-12 w-full max-w-6xl space-y-12 px-4">
        {tournaments.map((tournament) => (
          <TournamentLeaderboard
            key={tournament.id}
            tournament={tournament}
            entries={leaderboards[tournament.id] || []}
            loading={loadingTournaments[tournament.id] || false}
          />
        ))}
      </div>
    </div>
  );
}
