"use client";

import * as React from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { LeagueFilterSelect, LeagueLogo } from "@/components/admin/LeagueSelect";
import { MatchupDisplay } from "@/components/admin/MatchupDisplay";
import { PickFormDialog } from "@/components/admin/PickFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminApiError, deleteAdminPick, listAdminPicks } from "@/lib/api/adminApi";
import { readAuthSession } from "@/lib/authCookies";
import { formatDateET, formatDateTimeET } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/auth";
import type { AdminPick, ListPicksResponse, PickAccess, PickStatus } from "@/types/picks";
import { BET_TYPE_LABELS, PICK_ACCESS_LABELS, PICK_STATUS_LABELS } from "@/types/picks";
import type { League } from "@/types/picks";

const PAGE_SIZE = 20;
const COLUMN_COUNT = 11;

function authorName(pick: AdminPick) {
  const cb = pick.createdBy;
  if (typeof cb === "object" && cb !== null && "name" in cb) {
    return cb.name;
  }
  return "—";
}

function confidenceBadgeClass(n: number) {
  if (n >= 80) return "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25";
  if (n >= 60) return "bg-accent/15 text-accent ring-1 ring-inset ring-accent/30";
  return "bg-amber-500/12 text-amber-300 ring-1 ring-inset ring-amber-400/30";
}

function betTypeBadgeClass() {
  return "bg-white/5 text-slate-300 ring-1 ring-inset ring-white/10";
}

function accessBadgeClass(access: PickAccess) {
  return access === "free"
    ? "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-400/25"
    : "bg-violet-500/10 text-violet-200 ring-1 ring-inset ring-violet-400/25";
}

function pickAccess(pick: AdminPick): PickAccess {
  return pick.access === "free" ? "free" : "paid";
}

function statusBadgeClass(status: PickStatus) {
  return status === "active"
    ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25"
    : "bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/20";
}

function pickStatus(pick: AdminPick): PickStatus {
  return pick.status === "inactive" ? "inactive" : "active";
}

export default function AdminPicksPage() {
  const [role, setRole] = React.useState<AppRole | undefined>(undefined);
  const isHandicapper = role === "handicapper";

  React.useEffect(() => {
    setRole(readAuthSession()?.role);
  }, []);

  const [data, setData] = React.useState<ListPicksResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [leagueFilter, setLeagueFilter] = React.useState<League | "all">("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editPick, setEditPick] = React.useState<AdminPick | null>(null);
  const [viewPick, setViewPick] = React.useState<AdminPick | null>(null);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, leagueFilter]);

  const fetchPicks = React.useCallback(async (targetPage: number, search: string, league: League | "all") => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminPicks({
        page: targetPage,
        limit: PAGE_SIZE,
        search: search || undefined,
        league: league === "all" ? undefined : [league],
      });
      setData(result);
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load picks";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshKey = `${page}|${debouncedSearch}|${leagueFilter}`;
  const lastKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastKeyRef.current === refreshKey) return;
    lastKeyRef.current = refreshKey;
    fetchPicks(page, debouncedSearch, leagueFilter);
  }, [fetchPicks, page, debouncedSearch, leagueFilter, refreshKey]);

  const handleRefresh = () => {
    lastKeyRef.current = null;
    fetchPicks(page, debouncedSearch, leagueFilter);
  };

  const openCreate = () => {
    setEditPick(null);
    setFormOpen(true);
  };

  const openEdit = (pick: AdminPick) => {
    setEditPick(pick);
    setFormOpen(true);
  };

  const handleDelete = async (pick: AdminPick) => {
    if (!confirm(`Delete pick "${pick.pickTitle}"?`)) return;
    try {
      await deleteAdminPick(pick._id);
      toast.success("Pick deleted");
      lastKeyRef.current = null;
      fetchPicks(page, debouncedSearch, leagueFilter);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Failed to delete pick");
    }
  };

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const showingFrom = data ? (data.page - 1) * data.limit + 1 : 0;
  const showingTo = data ? Math.min(data.page * data.limit, data.total) : 0;

  return (
    <>
      <AdminHeader
        title="Picks"
        subtitle={
          isHandicapper
            ? "Upload and manage your picks for members"
            : "Upload and manage expert picks for members"
        }
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="typo-heading-lg text-white">Pick management</h1>
            <p className="mt-1 typo-body-md text-subtle">
              {isHandicapper
                ? "Create and edit your picks with game info, analysis, odds, bet type, and confidence."
                : "Create picks with game info, analysis, odds, bet type, and confidence."}
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreate}
            className="bg-accent text-slate-950 hover:brightness-105"
          >
            <Plus className="mr-2 size-4" />
            Upload pick
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-55 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search game, title, or analysis…"
              className="h-9 border-white/12 bg-white/5 pl-9 pr-9 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25"
            />
            {searchInput ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
          <LeagueFilterSelect value={leagueFilter} onChange={setLeagueFilter} />
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh"
              className="h-9 gap-2 border-white/12 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        <section className="overflow-hidden">
          {error ? (
            <div className="flex items-start gap-3 px-5 py-4 text-rose-200">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="typo-body-sm font-medium">Couldn&apos;t load picks</p>
                <p className="typo-caption text-rose-200/80">{error}</p>
              </div>
            </div>
          ) : null}

          <Table className="text-slate-100">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  League
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Matchup
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Pick title
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Access
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Status
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Bet type
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Odds
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Confidence
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Match time
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Posted
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-right text-subtle">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/5">
              {loading && !data ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`skel-${i}`} className="border-white/5 hover:bg-transparent">
                    {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                      <TableCell key={`skel-${i}-${j}`}>
                        <Skeleton className="h-4 w-24 bg-white/10" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data && data.picks.length > 0 ? (
                data.picks.map((pick) => (
                  <TableRow
                    key={pick._id}
                    className="border-white/5 transition hover:bg-white/4"
                  >
                    <TableCell>
                      {pick.league ? (
                        <span className="inline-flex items-center gap-2.5">
                          <LeagueLogo league={pick.league} size={22} />
                          <span className="typo-body-sm font-medium text-white">
                            {pick.league}
                          </span>
                        </span>
                      ) : (
                        <span className="typo-body-sm text-subtle">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-60 whitespace-normal">
                      <MatchupDisplay pick={pick} logoSize={16} />
                    </TableCell>
                    <TableCell className="max-w-50 whitespace-normal">
                      <p className="line-clamp-2 typo-body-sm font-medium text-white">
                        {pick.pickTitle}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          accessBadgeClass(pickAccess(pick))
                        )}
                      >
                        {PICK_ACCESS_LABELS[pickAccess(pick)]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          statusBadgeClass(pickStatus(pick))
                        )}
                      >
                        {PICK_STATUS_LABELS[pickStatus(pick)]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          betTypeBadgeClass()
                        )}
                      >
                        {BET_TYPE_LABELS[pick.betType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="typo-body-sm tabular-nums text-white">
                      {pick.odds}
                    </TableCell>
                    <TableCell>
                      {pick.confidence ? (
                        <Badge
                          className={cn(
                            "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold tabular-nums",
                            confidenceBadgeClass(pick.confidence)
                          )}
                        >
                          {pick.confidence}%
                        </Badge>
                      ) : (
                        <span className="text-subtle">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {pick.matchTime ? (
                        <>
                          <p className="typo-body-sm text-white">{formatDateET(pick.matchTime)}</p>
                          <p className="typo-caption text-subtle">{formatDateTimeET(pick.matchTime).split(',')[1]}</p>
                        </>
                      ) : (
                        <p className="typo-caption text-subtle">—</p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <p className="typo-body-sm text-white">{formatDateET(pick.createdAt)}</p>
                      <p className="typo-caption text-subtle">{authorName(pick)}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setViewPick(pick)}
                          className="h-8 gap-1.5 border border-transparent bg-[#c75931] text-white hover:bg-[#b54f2a] hover:text-white"
                        >
                          <Eye className="size-3.5" />
                          View
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          aria-label="Edit pick"
                          onClick={() => openEdit(pick)}
                          className="size-8 border-white/12 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          aria-label="Delete pick"
                          onClick={() => handleDelete(pick)}
                          className="size-8 border-white/12 bg-white/5 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : !loading && !error ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="py-10 text-center typo-body-sm text-subtle"
                  >
                    {debouncedSearch || leagueFilter !== "all"
                      ? "No picks match the current filters."
                      : "No picks yet. Upload your first pick."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
            <p className="typo-caption text-subtle">
              {data && data.picks.length > 0
                ? `Showing ${showingFrom.toLocaleString()}–${showingTo.toLocaleString()} of ${total.toLocaleString()}`
                : loading
                  ? "Loading…"
                  : "—"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 gap-1 border-white/12 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="size-4" /> Prev
              </Button>
              <span className="typo-caption text-slate-300">
                Page <span className="font-semibold text-white">{data?.page ?? page}</span>
                {data ? <> / {totalPages}</> : null}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || (data ? page >= totalPages : true)}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 gap-1 border-white/12 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      <PickFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        pick={editPick}
        onSaved={() => {
          lastKeyRef.current = null;
          fetchPicks(page, debouncedSearch, leagueFilter);
        }}
      />

      <Dialog open={Boolean(viewPick)} onOpenChange={(o) => !o && setViewPick(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto border border-white/10 bg-linear-to-br from-[#0f0f0f] to-[#1a1a1a] p-0 text-slate-100 sm:max-w-xl">
          {viewPick ? (
            <>
              {/* Header */}
              <div className="border-b border-white/10 bg-linear-to-r from-accent/10 to-transparent px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl font-bold text-white leading-tight">
                        {viewPick.pickTitle}
                      </DialogTitle>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge className="bg-accent/20 text-accent border border-accent/40 text-sm py-1 px-3">
                          {viewPick.league}
                        </Badge>
                        <Badge
                          className={cn(
                            "rounded-full border-transparent px-3 py-1 text-xs font-semibold",
                            accessBadgeClass(pickAccess(viewPick))
                          )}
                        >
                          {PICK_ACCESS_LABELS[pickAccess(viewPick)]}
                        </Badge>
                        <Badge
                          className={cn(
                            "rounded-full border-transparent px-3 py-1 text-xs font-semibold",
                            statusBadgeClass(pickStatus(viewPick))
                          )}
                        >
                          {PICK_STATUS_LABELS[pickStatus(viewPick)]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matchup & Quick Info */}
              <div className="border-b border-white/10 px-6 py-5">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Matchup</p>
                  <div className="flex items-center justify-center gap-6 py-4">
                    <MatchupDisplay pick={viewPick} logoSize={48} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Bet Type</p>
                    <p className="mt-2 text-sm font-medium text-white">{BET_TYPE_LABELS[viewPick.betType]}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Odds</p>
                    <p className="mt-2 text-sm font-medium text-accent">{viewPick.odds}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Confidence</p>
                    {viewPick.confidence ? (
                      <div className="mt-2 flex items-baseline gap-1">
                        <TrendingUp className="size-4 text-emerald-500" />
                        <p className="text-sm font-bold text-emerald-400">{viewPick.confidence}%</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-zinc-400">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Expert Analysis</p>
                <div className="bg-white/3 rounded-lg border border-white/5 p-4">
                  <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {viewPick.detailedAnalysis}
                  </p>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Timeline</p>
                <div className="space-y-3">
                  {viewPick.matchTime ? (
                    <div className="flex items-start gap-3">
                      <Clock className="size-5 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Match Time</p>
                        <p className="mt-1 text-sm text-white">{formatDateTimeET(viewPick.matchTime)}</p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <Clock className="size-5 text-zinc-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Posted</p>
                      <p className="mt-1 text-sm text-white">{formatDateTimeET(viewPick.createdAt)}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">by {authorName(viewPick)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-white/2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  onClick={() => setViewPick(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="bg-accent text-slate-950 hover:brightness-110 font-medium"
                  onClick={() => {
                    setViewPick(null);
                    openEdit(viewPick);
                  }}
                >
                  Edit Pick
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
