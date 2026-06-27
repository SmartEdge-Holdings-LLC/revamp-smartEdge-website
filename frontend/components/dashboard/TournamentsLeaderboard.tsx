"use client";

import * as React from "react";
import { ChevronLeft, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTournamentLeaderboard,
  type LeaderboardEntry,
} from "@/lib/api/tournamentApi";
import { cn } from "@/lib/utils";

interface TournamentsLeaderboardProps {
  tournamentId: string | null;
  tournamentName: string;
  currentUserId: string;
  token: string;
  onBack: () => void;
}

export function TournamentsLeaderboard({
  tournamentId,
  tournamentName,
  currentUserId,
  token,
  onBack,
}: TournamentsLeaderboardProps) {
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchLeaderboard = React.useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const res = await getTournamentLeaderboard(token, tournamentId);
      setEntries(res.entries);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, token]);

  React.useEffect(() => {
    void fetchLeaderboard();
    const interval = setInterval(() => void fetchLeaderboard(), 30_000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  if (!tournamentId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-white/6 bg-white/2">
          <Crown className="size-7 text-zinc-600" strokeWidth={1.5} />
        </div>
        <p className="typo-body-sm text-zinc-500">
          Select a tournament to view its leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-zinc-500 hover:text-white"
          onClick={onBack}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">
            {tournamentName}
          </h3>
          <p className="typo-caption text-zinc-500">
            Live leaderboard · refreshes every 30s
          </p>
        </div>
      </div>

      {loading && entries.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/4" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/6 bg-white/2">
            <Users className="size-6 text-zinc-600" strokeWidth={1.5} />
          </div>
          <p className="typo-body-sm text-zinc-500">No entries yet.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => {
            const isMe = entry.memberId === currentUserId;
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all",
                  isMe
                    ? "border-accent/20 bg-accent/6 shadow-[0_0_20px_rgb(234_105_58/0.05)]"
                    : isFirst
                      ? "border-amber-500/15 bg-amber-500/4"
                      : "border-white/4 bg-white/2"
                )}
              >
                {/* Rank */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold">
                  {isFirst ? (
                    <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/15">
                      <Crown className="size-4.5 text-amber-400" />
                    </div>
                  ) : isSecond ? (
                    <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-400/10">
                      <span className="text-zinc-300">{entry.rank}</span>
                    </div>
                  ) : isThird ? (
                    <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/10">
                      <span className="text-orange-400">{entry.rank}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600">{entry.rank}</span>
                  )}
                </div>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className="typo-body-sm font-medium text-white truncate">
                    {entry.memberName}
                    {isMe && (
                      <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 typo-caption font-semibold text-accent">
                        You
                      </span>
                    )}
                  </p>
                  <p className="typo-caption text-zinc-600">
                    {entry.picks.length} pick{entry.picks.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className={cn(
                    "text-xl font-bold tabular-nums",
                    isFirst ? "text-amber-400" : isMe ? "text-accent" : "text-white"
                  )}>
                    {entry.score}
                  </p>
                  <p className="typo-caption text-zinc-600">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
