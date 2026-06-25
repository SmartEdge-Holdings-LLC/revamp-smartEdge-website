"use client";

import * as React from "react";
import {
  Award,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Crown,
  Flame,
  Loader2,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getMyTournamentEntries,
  getTournament,
  getTournamentLeaderboard,
  joinTournament,
  listActiveTournaments,
  submitTournamentPicks,
  type LeaderboardEntry,
  type MyTournamentEntry,
  type Tournament,
  type TournamentGame,
} from "@/lib/api/tournamentApi";
import { cn } from "@/lib/utils";
import type { SessionMemberUser } from "@/types/member-session";

type Tab = "browse" | "my" | "leaderboard";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "browse", label: "Browse", icon: Swords },
  { key: "my", label: "My Tournaments", icon: Trophy },
  { key: "leaderboard", label: "Leaderboard", icon: Crown },
];

/* ── Helpers ── */

function prizeText(t: Tournament) {
  switch (t.prize.type) {
    case "discount":
      return `${t.prize.value}% Discount`;
    case "freeMonth":
      return `${t.prize.value} Free Month${t.prize.value !== 1 ? "s" : ""}`;
    case "custom":
      return t.prize.description || `$${t.prize.value} Prize`;
  }
}

function formatDateRange(start: string, end: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  const year = new Date(end).getFullYear();
  return `${fmt(start)} – ${fmt(end)}, ${year}`;
}

function timeRemaining(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d remaining`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h remaining`;
  const mins = Math.floor(diff / (1000 * 60));
  return `${mins}m remaining`;
}

/* ── Tournament Card (Browse) ── */

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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgb(0_0_0/0.4)]">
      {/* Top accent bar */}
      <div className={cn(
        "h-1 w-full",
        isActive
          ? "pricing-accent-gradient"
          : "bg-gradient-to-r from-blue-500/40 via-blue-400/20 to-transparent"
      )} />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
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
            <h3 className="mt-2.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
              {tournament.name}
            </h3>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <Trophy className="size-5 text-accent" />
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex items-center gap-4 typo-body-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatDateRange(tournament.startDate, tournament.endDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {tournament.entries}
          </span>
          <span className="flex items-center gap-1.5">
            <Target className="size-3.5" />
            {tournament.gameIds.length} games
          </span>
        </div>

        {/* Prize banner */}
        <div className="pricing-accent-gradient gradient-animate mt-5 flex items-center gap-3 rounded-xl px-4 py-3.5 shadow-[0_4px_24px_rgb(212_98_56/0.25),inset_0_1px_0_rgb(255_255_255/0.25)]">
          <div className="flex size-9 items-center justify-center rounded-lg bg-black/20">
            <Award className="size-4.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="typo-caption font-semibold uppercase tracking-wider text-white/60">
              Prize
            </p>
            <p className="typo-body-sm font-bold text-white">
              {prizeText(tournament)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 text-zinc-400 hover:text-white"
            onClick={onLeaderboard}
          >
            View Leaderboard
          </Button>
          {isActive &&
            (joined ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-2 typo-body-sm font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                <Check className="size-3.5" /> Joined
              </span>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-9 pricing-accent-gradient px-5 font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] hover:brightness-110"
                onClick={onJoin}
                disabled={joining}
              >
                {joining ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <Flame className="mr-1.5 size-4" />
                )}
                Join Tournament
              </Button>
            ))}
        </div>
      </div>
    </article>
  );
}

/* ── My Entry Card ── */

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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgb(0_0_0/0.4)]">
      <div className={cn(
        "h-1 w-full",
        isActive ? "pricing-accent-gradient" : "bg-gradient-to-r from-blue-500/40 via-blue-400/20 to-transparent"
      )} />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge className={cn(
                "rounded-full border-transparent px-2.5 py-0.5 typo-caption font-semibold",
                isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"
              )}>
                {isActive ? "Active" : "Completed"}
              </Badge>
            </div>
            <h3 className="mt-2.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
              {t.name}
            </h3>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "Score", value: String(entry.score), highlight: entry.score > 0 },
            { label: "Rank", value: entry.rank ? `#${entry.rank}` : "—", highlight: entry.rank === 1 },
            { label: "Picks", value: String(entry.picks.length), highlight: false },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col items-center rounded-xl border px-3 py-3",
                stat.highlight
                  ? "border-accent/15 bg-accent/[0.06]"
                  : "border-white/[0.06] bg-white/[0.02]"
              )}
            >
              <span className="typo-caption font-medium uppercase tracking-wider text-zinc-500">
                {stat.label}
              </span>
              <span className={cn(
                "mt-1 text-2xl font-bold tabular-nums",
                stat.highlight ? "text-accent" : "text-white"
              )}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Prize */}
        <div className="pricing-accent-gradient gradient-animate mt-4 flex items-center gap-3 rounded-xl px-4 py-3.5 shadow-[0_4px_24px_rgb(212_98_56/0.25),inset_0_1px_0_rgb(255_255_255/0.25)]">
          <div className="flex size-9 items-center justify-center rounded-lg bg-black/20">
            <Award className="size-4.5 text-white" />
          </div>
          <p className="typo-body-sm font-bold text-white">
            {prizeText(t)}
          </p>
          {entry.prizeStatus === "claimed" && (
            <Badge className="ml-auto rounded-full border-transparent bg-black/20 px-2.5 py-0.5 typo-caption font-semibold text-white">
              Claimed
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 text-zinc-400 hover:text-white"
            onClick={onLeaderboard}
          >
            Leaderboard
          </Button>
          {isActive && (
            <Button
              type="button"
              size="sm"
              className="ml-auto h-9 pricing-accent-gradient px-5 font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] hover:brightness-110"
              onClick={onSelectPicks}
            >
              <Target className="mr-1.5 size-4" />
              {entry.picks.length > 0 ? "Edit Picks" : "Select Picks"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

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

  React.useEffect(() => {
    if (open) setSelected(new Set(currentPicks));
  }, [open, currentPicks]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden border-white/[0.08] bg-[#080808] p-0 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/[0.06] px-6 pb-4 pt-5">
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
                const matchup =
                  game.awayTeamName && game.homeTeamName
                    ? `${game.awayTeamName} vs ${game.homeTeamName}`
                    : game.game || game.pickTitle;
                return (
                  <li key={game.id}>
                    <button
                      type="button"
                      onClick={() => toggle(game.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200",
                        isSelected
                          ? "border-accent/25 bg-accent/[0.08] shadow-[0_0_20px_rgb(234_105_58/0.06)]"
                          : "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.04]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                          isSelected
                            ? "border-accent bg-accent text-white shadow-[0_0_8px_rgb(234_105_58/0.3)]"
                            : "border-white/15 bg-white/5"
                        )}
                      >
                        {isSelected && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="typo-body-sm font-medium text-white truncate">
                          {matchup}
                        </p>
                        <p className="mt-0.5 typo-caption text-zinc-500">
                          {game.betType} · {game.odds}
                          {game.matchTime &&
                            ` · ${new Date(game.matchTime).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md bg-white/[0.06] px-2 py-0.5 typo-caption font-medium text-zinc-500">
                        {game.league}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 border-t border-white/[0.06] px-6 py-4">
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

/* ── Leaderboard Panel ── */

function LeaderboardPanel({
  tournamentId,
  tournamentName,
  currentUserId,
  token,
  onBack,
}: {
  tournamentId: string | null;
  tournamentName: string;
  currentUserId: string;
  token: string;
  onBack: () => void;
}) {
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetch_ = React.useCallback(async () => {
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
    void fetch_();
    const interval = setInterval(() => void fetch_(), 30_000);
    return () => clearInterval(interval);
  }, [fetch_]);

  if (!tournamentId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
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
            <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
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
                    ? "border-accent/20 bg-accent/[0.06] shadow-[0_0_20px_rgb(234_105_58/0.05)]"
                    : isFirst
                      ? "border-amber-500/15 bg-amber-500/[0.04]"
                      : "border-white/[0.04] bg-white/[0.02]"
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

/* ── Main Component ── */

interface DashboardTournamentsProps {
  user: SessionMemberUser;
}

export function DashboardTournaments({ user }: DashboardTournamentsProps) {
  const token = user.backendToken;
  const userId = user._id ?? user.id;

  const [activeTab, setActiveTab] = React.useState<Tab>("browse");
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [myEntries, setMyEntries] = React.useState<MyTournamentEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [joiningId, setJoiningId] = React.useState<string | null>(null);
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(new Set());

  const [leaderboardId, setLeaderboardId] = React.useState<string | null>(null);
  const [leaderboardName, setLeaderboardName] = React.useState("");

  const [pickDialogOpen, setPickDialogOpen] = React.useState(false);
  const [pickTournament, setPickTournament] = React.useState<Tournament | null>(null);
  const [pickGames, setPickGames] = React.useState<TournamentGame[]>([]);
  const [pickCurrent, setPickCurrent] = React.useState<string[]>([]);

  const fetchBrowse = React.useCallback(async () => {
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
    if (activeTab === "browse") void fetchBrowse();
    else if (activeTab === "my") void fetchMyEntries();
  }, [activeTab, fetchBrowse, fetchMyEntries]);

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

  const openLeaderboard = (id: string, name: string) => {
    setLeaderboardId(id);
    setLeaderboardName(name);
    setActiveTab("leaderboard");
  };

  const openPickSelector = async (entry: MyTournamentEntry) => {
    if (!entry.tournament) return;
    try {
      const res = await getTournament(token, entry.tournamentId);
      setPickTournament(res.tournament);
      setPickGames(res.tournament.games ?? []);
      setPickCurrent(entry.picks);
      setPickDialogOpen(true);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const isEmpty = !loading && activeTab === "browse" && tournaments.length === 0;
  const isMyEmpty = !loading && activeTab === "my" && myEntries.length === 0;

  return (
    <>
      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Tournaments
          </h1>
          <p className="mt-1.5 typo-body-md text-zinc-500">
            Compete on picks, climb the leaderboard, and win prizes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 typo-body-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 typo-body-sm text-red-300">
          {error}
        </p>
      )}

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
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
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {tournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  joined={joinedIds.has(t.id)}
                  onJoin={() => handleJoin(t.id)}
                  onLeaderboard={() => openLeaderboard(t.id, t.name)}
                  joining={joiningId === t.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Tournaments Tab */}
      {activeTab === "my" && (
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          ) : isMyEmpty ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
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
              <Button
                type="button"
                size="sm"
                className="mt-2 h-9 pricing-accent-gradient px-5 font-semibold text-white shadow-[0_4px_24px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.25)] hover:brightness-110"
                onClick={() => setActiveTab("browse")}
              >
                Browse Tournaments
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {myEntries.map((entry) => (
                <MyEntryCard
                  key={entry.id}
                  entry={entry}
                  onLeaderboard={() =>
                    openLeaderboard(
                      entry.tournamentId,
                      entry.tournament?.name ?? "Tournament"
                    )
                  }
                  onSelectPicks={() => openPickSelector(entry)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <div className="mt-8">
          <LeaderboardPanel
            tournamentId={leaderboardId}
            tournamentName={leaderboardName}
            currentUserId={userId}
            token={token}
            onBack={() => setActiveTab("browse")}
          />
        </div>
      )}

      {/* Pick Selector Dialog */}
      <PickSelectorDialog
        open={pickDialogOpen}
        onOpenChange={setPickDialogOpen}
        tournament={pickTournament}
        games={pickGames}
        currentPicks={pickCurrent}
        token={token}
        onSaved={() => void fetchMyEntries()}
      />
    </>
  );
}
