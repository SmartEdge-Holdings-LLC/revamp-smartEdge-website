"use client";

import * as React from "react";
import { Target, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  billingPanelClass,
  billingSecondaryButtonClass,
} from "@/components/billing/billing-styles";
import {
  getMyTournamentEntries,
  getTournament,
  type MyTournamentEntry,
  type Tournament,
  type TournamentGame,
} from "@/lib/api/tournamentApi";
import { cn } from "@/lib/utils";
import { prizeText } from "./tournament-utils";

interface MyTournamentsProps {
  token: string;
  onLeaderboard: () => void;
  onSelectPicks: (
    entry: MyTournamentEntry,
    tournament: Tournament,
    games: TournamentGame[]
  ) => void;
  refreshTrigger?: number;
}

function MyEntryCard({
  entry,
  onLeaderboard,
  onSelectPicks,
}: {
  entry: MyTournamentEntry;
  onLeaderboard: () => void;
  onSelectPicks: () => void;
}) {
  const t = entry.tournament;
  if (!t) return null;
  const isActive = t.status === "active";

  return (
    <div className={cn(billingPanelClass, "flex flex-col")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "rounded-full border-transparent px-2.5 py-0.5 typo-caption font-semibold",
              isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"
            )}>
              {isActive ? "Active" : "Completed"}
            </Badge>
          </div>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-white">
            {t.name}
          </h3>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Score", value: String(entry.score), highlight: entry.score > 0 },
          { label: "Rank", value: entry.rank ? `#${entry.rank}` : "—", highlight: entry.rank === 1 },
          { label: "Picks", value: String(entry.picks.length), highlight: false },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col items-center rounded-md border px-3 py-2",
              stat.highlight
                ? "border-accent/30 bg-accent/8"
                : "border-white/10 bg-white/5"
            )}
          >
            <span className="text-xs uppercase tracking-wider text-zinc-500">
              {stat.label}
            </span>
            <span className={cn(
              "mt-1 text-lg font-bold tabular-nums",
              stat.highlight ? "text-accent" : "text-white"
            )}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Prize */}
      <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-3">
        <p className="text-xs uppercase tracking-wider text-zinc-500">Prize</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="typo-body-sm font-semibold text-white">
            {prizeText(t)}
          </p>
          {entry.prizeStatus === "claimed" && (
            <Badge className="rounded-full border-transparent bg-emerald-500/15 px-2.5 py-0.5 typo-caption font-semibold text-emerald-300">
              Claimed
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("h-8 rounded-md", billingSecondaryButtonClass)}
          onClick={() => onLeaderboard()}
        >
          Leaderboard
        </Button>
        {isActive && (
          <Button
            type="button"
            size="sm"
            className="ml-auto h-8 pricing-accent-gradient px-4 typo-body-sm font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] hover:brightness-110"
            onClick={onSelectPicks}
          >
            <Target className="mr-1.5 size-3.5" />
            {entry.picks.length > 0 ? "Edit" : "Pick"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function MyTournaments({
  token,
  onLeaderboard,
  onSelectPicks,
  refreshTrigger = 0,
}: MyTournamentsProps) {
  const [myEntries, setMyEntries] = React.useState<MyTournamentEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMyEntries = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyTournamentEntries(token);
      setMyEntries(res.entries);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    void fetchMyEntries();
  }, [fetchMyEntries, refreshTrigger]);

  const isEmpty = !loading && myEntries.length === 0;

  const handleSelectPicks = async (entry: MyTournamentEntry) => {
    if (!entry.tournament) return;
    try {
      const res = await getTournament(token, entry.tournamentId);
      onSelectPicks(entry, res.tournament, res.tournament.games ?? []);
    } catch (err) {
      alert((err as Error).message);
    }
  };

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
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg bg-white/4" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="flex size-16 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Trophy className="size-7 text-zinc-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="typo-body-sm font-medium text-white">
                You haven&apos;t joined any tournaments yet
              </p>
              <p className="mt-1 max-w-sm typo-caption text-zinc-600">
                Browse active tournaments and join one to start competing.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {myEntries.map((entry) => (
              <MyEntryCard
                key={entry.id}
                entry={entry}
                onLeaderboard={onLeaderboard}
                onSelectPicks={() => handleSelectPicks(entry)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
