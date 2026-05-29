"use client";

import * as React from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
const COLUMN_COUNT = 10;

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
          <div className="relative min-w-[220px] flex-1 sm:max-w-md">
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
                    <TableCell className="max-w-[240px] whitespace-normal">
                      <MatchupDisplay pick={pick} logoSize={16} />
                    </TableCell>
                    <TableCell className="max-w-[200px] whitespace-normal">
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
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold tabular-nums",
                          confidenceBadgeClass(pick.confidence)
                        )}
                      >
                        {pick.confidence}%
                      </Badge>
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
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto border-white/8 bg-[#0a0a0a] p-0 text-slate-100 sm:max-w-lg">
          {viewPick ? (
            <>
              <div className="border-b border-white/8 px-5 py-4">
                <DialogTitle className="text-[15px] font-semibold text-white">
                  {viewPick.pickTitle}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-white/5 text-slate-200 ring-1 ring-inset ring-white/10">
                        {viewPick.league}
                      </Badge>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          accessBadgeClass(pickAccess(viewPick))
                        )}
                      >
                        {PICK_ACCESS_LABELS[pickAccess(viewPick)]}
                      </Badge>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          statusBadgeClass(pickStatus(viewPick))
                        )}
                      >
                        {PICK_STATUS_LABELS[pickStatus(viewPick)]}
                      </Badge>
                      <MatchupDisplay pick={viewPick} logoSize={20} />
                    </div>
                    <p className="typo-caption text-subtle">
                      {BET_TYPE_LABELS[viewPick.betType]} · {viewPick.odds} · {viewPick.confidence}% confidence
                    </p>
                  </div>
                </DialogDescription>
              </div>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="typo-caption font-medium text-zinc-500">Analysis</p>
                  <p className="mt-2 whitespace-pre-wrap typo-body-sm leading-relaxed text-slate-200">
                    {viewPick.detailedAnalysis}
                  </p>
                </div>
                <p className="typo-caption text-zinc-600">
                  Posted {formatDateTimeET(viewPick.createdAt)} by {authorName(viewPick)}
                </p>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/8 px-5 py-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-300 hover:bg-white/10"
                  onClick={() => setViewPick(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="bg-accent text-slate-950 hover:brightness-105"
                  onClick={() => {
                    setViewPick(null);
                    openEdit(viewPick);
                  }}
                >
                  Edit
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
