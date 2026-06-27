"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  submitTournamentPicks,
  type MyTournamentEntry,
  type Tournament,
  type TournamentGame,
} from "@/lib/api/tournamentApi";
import { cn } from "@/lib/utils";
import type { SessionMemberUser } from "@/types/member-session";
import { BrowseTournaments } from "./BrowseTournaments";
import { MyTournaments } from "./MyTournaments";
import { PublicLeaderboards } from "./PublicLeaderboards";

type Tab = "browse" | "my" | "leaderboard";

/* ── Pick Selector Dialog ── */

function PickSelectorDialog({
  open,
  onOpenChange,
  tournament,
  games,
  currentPicks,
  token,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament | null;
  games: TournamentGame[];
  currentPicks: string[];
  token: string;
  onSaved: () => void;
}) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = React.useState(false);
  const lockedPicks = React.useMemo(() => new Set(currentPicks), [currentPicks]);

  React.useEffect(() => {
    if (open) setSelected(new Set(currentPicks));
  }, [open, currentPicks]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (lockedPicks.has(id)) {
          return prev;
        }
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isPickLocked = (id: string) => lockedPicks.has(id);

  const handleSubmit = async () => {
    if (!tournament) return;
    setSubmitting(true);
    try {
      await submitTournamentPicks(token, tournament.id, [...selected]);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-white/8 bg-[#080808] p-0 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/6 px-6 pb-4 pt-5">
          <DialogTitle className="text-lg font-semibold tracking-tight text-white">
            Select Your Picks
          </DialogTitle>
          <DialogDescription className="mt-1 flex items-center justify-between typo-body-sm text-zinc-500">
            <span>{tournament?.name}</span>
            <span className="rounded-full bg-accent/10 px-3 py-1 typo-caption font-semibold text-accent">
              {selected.size} / {games.length}
            </span>
          </DialogDescription>
        </div>

        {/* Game list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {games.length === 0 ? (
            <p className="py-8 text-center typo-body-sm text-zinc-500">
              No games available for this tournament.
            </p>
          ) : (
            <ul className="space-y-2">
              {games.map((game) => {
                const isSelected = selected.has(game.id);
                const locked = isPickLocked(game.id);
                const matchup =
                  game.awayTeamName && game.homeTeamName
                    ? `${game.awayTeamName} vs ${game.homeTeamName}`
                    : game.game || game.pickTitle;
                return (
                  <li key={game.id}>
                    <button
                      type="button"
                      onClick={() => toggle(game.id)}
                      disabled={locked}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200",
                        locked
                          ? "cursor-not-allowed border-emerald-500/20 bg-emerald-500/8"
                          : isSelected
                            ? "border-accent/25 bg-accent/8 shadow-[0_0_20px_rgb(234_105_58/0.06)]"
                            : "border-white/4 bg-white/2 hover:border-white/8 hover:bg-white/4"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                          locked
                            ? "border-emerald-500/40 bg-emerald-500/20 text-white"
                            : isSelected
                              ? "border-accent bg-accent text-white shadow-[0_0_8px_rgb(234_105_58/0.3)]"
                              : "border-white/15 bg-white/5"
                        )}
                      >
                        {isSelected && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "typo-body-sm font-medium truncate",
                          locked ? "text-emerald-300" : "text-white"
                        )}>
                          {matchup}
                        </p>
                        <p className={cn(
                          "mt-0.5 typo-caption",
                          locked ? "text-emerald-600" : "text-zinc-500"
                        )}>
                          {game.betType} · {game.odds}
                          {game.matchTime &&
                            ` · ${new Date(game.matchTime).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
                        </p>
                      </div>
                      <span className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 typo-caption font-medium",
                        locked
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/6 text-zinc-500"
                      )}>
                        {locked ? "Locked" : game.league}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 border-t border-white/6 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            className="h-9 text-zinc-400 hover:text-white"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 pricing-accent-gradient px-5 font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] hover:brightness-110"
            onClick={handleSubmit}
            disabled={submitting || selected.size === 0}
          >
            {submitting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Submit Picks ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Component ── */

interface DashboardTournamentsProps {
  user: SessionMemberUser;
}

export function DashboardTournaments({ user }: DashboardTournamentsProps) {
  const token = user.backendToken;
  const userId = user._id ?? user.id;

  const [activeTab, setActiveTab] = React.useState<Tab>("browse");
  const [pickDialogOpen, setPickDialogOpen] = React.useState(false);
  const [pickTournament, setPickTournament] = React.useState<Tournament | null>(null);
  const [pickGames, setPickGames] = React.useState<TournamentGame[]>([]);
  const [pickCurrent, setPickCurrent] = React.useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const tabs: { key: Tab; label: string }[] = [
    { key: "browse", label: "Browse" },
    { key: "my", label: "My Tournaments" },
    { key: "leaderboard", label: "Leaderboard" },
  ];


  const handleSelectPicks = (
    entry: MyTournamentEntry,
    tournament: Tournament,
    games: TournamentGame[]
  ) => {
    setPickTournament(tournament);
    setPickGames(games);
    setPickCurrent(entry.picks);
    setPickDialogOpen(true);
  };

  const handlePicksSaved = () => {
    setPickDialogOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      {/* Page header */}
      <div className="max-w-4xl text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Tournaments
        </h1>
        <p className="mt-1 typo-body-md text-zinc-500">
          Compete on picks, climb the leaderboard, and win prizes.
        </p>
      </div>

      {/* Tabs */}
      <nav
        className="mt-4 flex flex-wrap justify-start gap-x-8 gap-y-1 border-b border-white/10"
        aria-label="Tournament sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative -mb-px cursor-pointer pb-3 text-sm transition-colors",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {isActive ? (
                <span className="absolute inset-x-0 bottom-0 h-px bg-white" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <BrowseTournaments
          token={token}
          onLeaderboard={() => setActiveTab("leaderboard")}
        />
      )}

      {/* My Tournaments Tab */}
      {activeTab === "my" && (
        <MyTournaments
          token={token}
          onLeaderboard={() => setActiveTab("leaderboard")}
          onSelectPicks={handleSelectPicks}
          refreshTrigger={refreshTrigger}
        />
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <PublicLeaderboards
          token={token}
          currentUserId={userId}
        />
      )}

      {/* Pick Selector Dialog */}
      <PickSelectorDialog
        open={pickDialogOpen}
        onOpenChange={setPickDialogOpen}
        tournament={pickTournament}
        games={pickGames}
        currentPicks={pickCurrent}
        token={token}
        onSaved={handlePicksSaved}
      />
    </>
  );
}
