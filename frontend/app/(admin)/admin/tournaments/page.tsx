"use client";

import * as React from "react";
import {
  Award,
  Download,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Swords,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TournamentFormDialog } from "@/components/admin/TournamentFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminApiError,
  deleteAdminTournament,
  getAdminTournamentLeaderboard,
  listAdminTournaments,
  markTournamentPrizeClaimed,
} from "@/lib/api/adminApi";
import { cn } from "@/lib/utils";
import type {
  AdminTournament,
  LeaderboardEntry,
  TournamentStatus,
} from "@/types/tournaments";

const COLUMN_COUNT = 7;

function statusBadgeClass(status: TournamentStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25";
    case "completed":
      return "bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-400/25";
    default:
      return "bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/20";
  }
}

function prizeLabel(t: AdminTournament) {
  switch (t.prize.type) {
    case "discount":
      return `${t.prize.value}% off`;
    case "freeMonth":
      return `${t.prize.value} free month${t.prize.value !== 1 ? "s" : ""}`;
    case "custom":
      return t.prize.description || `$${t.prize.value}`;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function downloadCsv(entries: LeaderboardEntry[], tournamentName: string) {
  const header = "Rank,Name,Email,Score,Games Correct,Prize Status,Last Updated";
  const rows = entries.map(
    (e) =>
      `${e.rank},"${e.memberName}","${e.memberEmail}",${e.score},${e.picks.length},${e.prizeStatus},${e.updatedAt}`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tournamentName.replace(/\s+/g, "_")}_leaderboard.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Leaderboard Dialog ── */

function LeaderboardDialog({
  tournament,
  open,
  onOpenChange,
}: {
  tournament: AdminTournament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [claiming, setClaiming] = React.useState<string | null>(null);

  const fetchLeaderboard = React.useCallback(async () => {
    if (!tournament) return;
    setLoading(true);
    try {
      const res = await getAdminTournamentLeaderboard(tournament.id);
      setEntries(res.entries);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [tournament]);

  React.useEffect(() => {
    if (!open || !tournament) return;
    void fetchLeaderboard();
    const interval = setInterval(() => void fetchLeaderboard(), 30_000);
    return () => clearInterval(interval);
  }, [open, tournament, fetchLeaderboard]);

  const handleClaim = async (memberId: string) => {
    if (!tournament) return;
    setClaiming(memberId);
    try {
      await markTournamentPrizeClaimed(tournament.id, memberId);
      toast.success("Prize marked as claimed");
      await fetchLeaderboard();
    } catch (err) {
      toast.error(
        err instanceof AdminApiError ? err.message : "Failed to claim prize"
      );
    } finally {
      setClaiming(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden border-white/10 bg-[#0c0c0c] p-0 text-slate-100">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div>
            <DialogTitle className="typo-heading-md text-white">
              Leaderboard
            </DialogTitle>
            {tournament && (
              <p className="mt-0.5 typo-body-sm text-subtle">
                {tournament.name}
              </p>
            )}
          </div>
          {entries.length > 0 && tournament && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-subtle hover:text-white"
              onClick={() => downloadCsv(entries, tournament.name)}
            >
              <Download className="mr-1.5 size-4" />
              CSV
            </Button>
          )}
        </div>

        <div className="overflow-y-auto px-5 pb-5">
          {loading && entries.length === 0 ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-white/10" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="py-10 text-center typo-body-sm text-subtle">
              No entries yet.
            </p>
          ) : (
            <Table className="text-slate-100">
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle w-14">
                    Rank
                  </TableHead>
                  <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                    Member
                  </TableHead>
                  <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle text-right w-20">
                    Score
                  </TableHead>
                  <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle text-right w-24">
                    Picks
                  </TableHead>
                  <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle w-32">
                    Prize
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={cn(
                      "border-white/5 transition",
                      entry.rank === 1 && "bg-amber-500/5"
                    )}
                  >
                    <TableCell className="font-mono typo-body-sm font-semibold">
                      {entry.rank === 1 ? (
                        <span className="flex items-center gap-1.5">
                          <Award className="size-4 text-amber-400" />
                          <span className="text-amber-300">1</span>
                        </span>
                      ) : (
                        <span className="text-subtle">{entry.rank}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="typo-body-sm font-medium text-white">
                        {entry.memberName}
                      </p>
                      <p className="typo-caption text-subtle">
                        {entry.memberEmail}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono typo-body-sm font-semibold text-white tabular-nums">
                      {entry.score}
                    </TableCell>
                    <TableCell className="text-right typo-body-sm text-subtle tabular-nums">
                      {entry.picks.length}
                    </TableCell>
                    <TableCell>
                      {entry.prizeStatus === "claimed" ? (
                        <Badge className="rounded-full border-transparent bg-emerald-500/10 px-2 py-0.5 typo-caption font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
                          Claimed
                        </Badge>
                      ) : entry.rank === 1 &&
                        tournament?.status === "completed" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 typo-caption text-accent hover:text-accent hover:bg-accent/10"
                          onClick={() => handleClaim(entry.memberId)}
                          disabled={claiming === entry.memberId}
                        >
                          Mark claimed
                        </Button>
                      ) : (
                        <span className="typo-caption text-subtle">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && entries.length > 0 && (
            <p className="mt-3 text-right typo-caption text-subtle">
              Auto-refreshes every 30s
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Page ── */

export default function TournamentsPage() {
  const [tournaments, setTournaments] = React.useState<AdminTournament[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editTournament, setEditTournament] =
    React.useState<AdminTournament | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [leaderboardTournament, setLeaderboardTournament] =
    React.useState<AdminTournament | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = React.useState(false);

  const fetchTournaments = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminTournaments(
        statusFilter || undefined
      );
      setTournaments(result.tournaments);
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load tournaments";
      setError(message);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    void fetchTournaments();
  }, [fetchTournaments]);

  const handleDelete = async (t: AdminTournament) => {
    if (
      !confirm(
        `Delete "${t.name}"? All entries will be removed. This cannot be undone.`
      )
    )
      return;
    setDeletingId(t.id);
    try {
      await deleteAdminTournament(t.id);
      toast.success("Tournament deleted");
      await fetchTournaments();
    } catch (err) {
      toast.error(
        err instanceof AdminApiError ? err.message : "Failed to delete"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openCreate = () => {
    setEditTournament(null);
    setFormOpen(true);
  };

  const openEdit = (t: AdminTournament) => {
    setEditTournament(t);
    setFormOpen(true);
  };

  const openLeaderboard = (t: AdminTournament) => {
    setLeaderboardTournament(t);
    setLeaderboardOpen(true);
  };

  const isEmpty = !loading && tournaments.length === 0;

  const selectClass =
    "h-9 rounded-md border-white/12 bg-white/5 px-3 typo-body-sm text-slate-100 focus-visible:border-accent/55 focus-visible:ring-accent/25";

  return (
    <>
      <AdminHeader
        title="Tournaments"
        subtitle="Create and manage pick tournaments with live leaderboards"
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="typo-heading-lg text-white">Tournament manager</h1>
            <p className="mt-1 typo-body-md text-subtle">
              Create tournaments, assign games, track leaderboards, and
              distribute prizes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-subtle hover:text-white"
              onClick={() => void fetchTournaments()}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw
                className={cn("size-4", loading && "animate-spin")}
              />
            </Button>
            <Button
              type="button"
              className="bg-accent text-slate-950 hover:brightness-105"
              onClick={openCreate}
            >
              <Plus className="mr-2 size-4" />
              Create tournament
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 typo-body-sm text-red-300">
            {error}
          </p>
        )}

        {/* Table */}
        <section className="overflow-hidden">
          <Table className="text-slate-100">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Name
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Status
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Duration
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle text-right">
                  Entries
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle text-right">
                  Games
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Prize
                </TableHead>
                <TableHead className="w-[120px] typo-caption uppercase tracking-[0.12em] text-subtle">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className="border-white/5 hover:bg-transparent"
                  >
                    {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full max-w-[120px] bg-white/10" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isEmpty ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={COLUMN_COUNT} className="py-14">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <Swords
                          className="size-6 text-subtle"
                          strokeWidth={1.5}
                        />
                      </span>
                      <p className="typo-body-sm font-medium text-white">
                        No tournaments yet
                      </p>
                      <p className="max-w-md typo-caption text-subtle">
                        Create a tournament to let members compete on picks.
                        Set up prizes, assign games, and track live
                        leaderboards.
                      </p>
                      <Button
                        type="button"
                        className="mt-2 bg-accent text-slate-950 hover:brightness-105"
                        onClick={openCreate}
                      >
                        <Plus className="mr-2 size-4" />
                        Create tournament
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tournaments.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-white/5 transition hover:bg-white/4"
                  >
                    <TableCell className="typo-body-sm font-medium text-white">
                      {t.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          statusBadgeClass(t.status)
                        )}
                      >
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="typo-body-sm text-subtle">
                      {formatDuration(t.startDate, t.endDate)}
                    </TableCell>
                    <TableCell className="text-right typo-body-sm tabular-nums text-white">
                      {t.entries}
                    </TableCell>
                    <TableCell className="text-right typo-body-sm tabular-nums text-subtle">
                      {t.gameIds.length}
                    </TableCell>
                    <TableCell className="typo-body-sm text-white">
                      {prizeLabel(t)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-subtle hover:text-white"
                          onClick={() => openLeaderboard(t)}
                          aria-label={`View leaderboard for ${t.name}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-subtle hover:text-white"
                          onClick={() => openEdit(t)}
                          aria-label={`Edit ${t.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-subtle hover:text-red-400"
                          onClick={() => void handleDelete(t)}
                          disabled={deletingId === t.id}
                          aria-label={`Delete ${t.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </section>
      </div>

      <TournamentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tournament={editTournament}
        onSaved={() => void fetchTournaments()}
      />

      <LeaderboardDialog
        tournament={leaderboardTournament}
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
      />
    </>
  );
}
