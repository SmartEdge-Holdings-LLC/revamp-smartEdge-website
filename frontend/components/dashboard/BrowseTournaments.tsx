"use client";

import * as React from "react";
import { Check, Clock, Flame, Loader2, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  billingPanelClass,
  billingSecondaryButtonClass,
} from "@/components/billing/billing-styles";
import {
  listActiveTournaments,
  getMyTournamentEntries,
  joinTournament,
  type Tournament,
} from "@/lib/api/tournamentApi";
import { cn } from "@/lib/utils";
import { formatDateRange, prizeText, timeRemaining } from "./tournament-utils";

interface BrowseTournamentsProps {
  token: string;
  onLeaderboard: () => void;
}

function TournamentCard({
  tournament,
  joined,
  onJoin,
  onLeaderboard,
  joining,
}: {
  tournament: Tournament;
  joined: boolean;
  onJoin: () => void;
  onLeaderboard: () => void;
  joining: boolean;
}) {
  const isActive = tournament.status === "active";
  const remaining = isActive ? timeRemaining(tournament.endDate) : null;

  return (
    <div className={cn(billingPanelClass, "flex flex-col")}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "rounded-full border-transparent px-2.5 py-0.5 typo-caption font-semibold",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-blue-500/15 text-blue-400"
              )}
            >
              {isActive ? "Active" : "Completed"}
            </Badge>
            {remaining && remaining !== "Ended" && (
              <span className="flex items-center gap-1 typo-caption text-zinc-500">
                <Clock className="size-3" />
                {remaining}
              </span>
            )}
          </div>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-white">
            {tournament.name}
          </h3>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-left">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Dates</p>
          <p className="mt-1 typo-body-sm text-white">
            {formatDateRange(tournament.startDate, tournament.endDate)}
          </p>
        </div>
        <div className="text-left">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Entries</p>
          <p className="mt-1 typo-body-sm text-white">{tournament.entries}</p>
        </div>
        <div className="text-left">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Games</p>
          <p className="mt-1 typo-body-sm text-white">{tournament.gameIds.length}</p>
        </div>
      </div>

      {/* Prize */}
      <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-3">
        <p className="text-xs uppercase tracking-wider text-zinc-500">Prize</p>
        <p className="mt-1 typo-body-sm font-semibold text-white">
          {prizeText(tournament)}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-8 rounded-md", billingSecondaryButtonClass)}
          onClick={onLeaderboard}
        >
          View Leaderboard
        </Button>
        {isActive &&
          (joined ? (
            <Badge className="rounded-full border-transparent bg-emerald-500/15 px-3 py-1 typo-caption font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
              <Check className="mr-1.5 size-3" />
              Joined
            </Badge>
          ) : (
            <Button
              type="button"
              size="sm"
              className="h-8 pricing-accent-gradient px-4 typo-body-sm font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] hover:brightness-110"
              onClick={onJoin}
              disabled={joining}
            >
              {joining ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Flame className="mr-1.5 size-3.5" />
              )}
              Join
            </Button>
          ))}
      </div>
    </div>
  );
}

export function BrowseTournaments({
  token,
  onLeaderboard,
}: BrowseTournamentsProps) {
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set());

  const fetchTournaments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tourRes, entryRes] = await Promise.all([
        listActiveTournaments(token),
        getMyTournamentEntries(token),
      ]);
      setTournaments(tourRes.tournaments);
      setJoinedIds(new Set(entryRes.entries.map((e) => e.tournamentId)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    void fetchTournaments();
  }, [fetchTournaments]);

  const handleJoin = async (id: string) => {
    setJoiningId(id);
    try {
      await joinTournament(token, id);
      setJoinedIds((prev) => new Set([...prev, id]));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setJoiningId(null);
    }
  };

  const isEmpty = !loading && tournaments.length === 0;

  return (
    <>
      {error && (
        <p className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 typo-body-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-12 max-w-4xl">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg bg-white/4" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex size-16 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Swords className="size-7 text-zinc-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="typo-body-sm font-medium text-white">
                No active tournaments
              </p>
              <p className="mt-1 max-w-sm typo-caption text-zinc-600">
                Check back soon — new tournaments are posted regularly.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                joined={joinedIds.has(t.id)}
                onJoin={() => handleJoin(t.id)}
                onLeaderboard={onLeaderboard}
                joining={joiningId === t.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
