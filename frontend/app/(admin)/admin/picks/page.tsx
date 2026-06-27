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
import { Switch } from "@/components/ui/switch";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminApiError, deleteAdminPick, listAdminPicks, updateAdminPick } from "@/lib/api/adminApi";
import { readAuthSession } from "@/lib/authCookies";
import { formatDateET, formatDateTimeET } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/auth";
import type { AdminPick, ListPicksResponse, PickAccess, PickStatus } from "@/types/picks";
import { BET_TYPE_LABELS, PICK_ACCESS_LABELS, PICK_STATUS_LABELS } from "@/types/picks";
import type { League } from "@/types/picks";

const PAGE_SIZE = 20;
const COLUMN_COUNT = 12;

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
  switch (access) {
    case "free":
      return "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-400/25";
    case "tournament":
      return "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-400/25";
    case "smartedgeVIP":
      return "bg-purple-500/10 text-purple-300 ring-1 ring-inset ring-purple-400/25";
    case "smartedgeVIPPremium":
      return "bg-pink-500/10 text-pink-300 ring-1 ring-inset ring-pink-400/25";
    case "jonahweekly":
      return "bg-blue-500/10 text-blue-300 ring-1 ring-inset ring-blue-400/25";
    case "jonahvip":
      return "bg-green-500/10 text-green-300 ring-1 ring-inset ring-green-400/25";
    case "jonah-vip-premium":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25";
    default:
      return "bg-violet-500/10 text-violet-200 ring-1 ring-inset ring-violet-400/25";
  }
}

function pickAccess(pick: AdminPick): PickAccess {
  return (pick.access as PickAccess) || "free";
}

function statusBadgeClass(status: PickStatus) {
  return status === "active"
    ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25"
    : "bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/20";
}

function pickStatus(pick: AdminPick): PickStatus {
  return pick.status === "inactive" ? "inactive" : "active";
}

/* ── Mobile Pick Card ── */

function PickCard({
  pick,
  onView,
  onEdit,
  onDelete,
  onResult,
  onStatus,
}: {
  pick: AdminPick;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResult: (result: "won" | "lost" | "pending") => void;
  onStatus: (active: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-4 transition hover:bg-white/4">
      {/* Top row: league + badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {pick.league && (
          <span className="inline-flex items-center gap-1.5">
            <LeagueLogo league={pick.league} size={18} />
            <span className="typo-caption font-semibold text-white">{pick.league}</span>
          </span>
        )}
        <Badge className={cn("rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold", accessBadgeClass(pickAccess(pick)))}>
          {PICK_ACCESS_LABELS[pickAccess(pick)]}
        </Badge>
        <div className="flex items-center gap-2 px-2 py-0.5">
          <span className={cn("text-xs font-medium", pick.status === "active" ? "text-emerald-400" : "text-zinc-400")}>
            {pick.status === "active" ? "Active" : "Inactive"}
          </span>
          <Switch
            checked={pick.status === "active"}
            onCheckedChange={onStatus}
            aria-label="Toggle status"
            className="data-[state=checked]:bg-emerald-500 size-4"
          />
        </div>
      </div>

      {/* Title */}
      <p className="mt-2.5 typo-body-sm font-semibold text-white line-clamp-2">{pick.pickTitle}</p>

      {/* Matchup */}
      <div className="mt-2">
        <MatchupDisplay pick={pick} logoSize={14} />
      </div>

      {/* Stats row */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 typo-caption text-subtle">
        <span>{BET_TYPE_LABELS[pick.betType]}</span>
        <span className="text-white tabular-nums">{pick.odds}</span>
        {pick.confidence && (
          <span className={cn("font-semibold tabular-nums", pick.confidence >= 80 ? "text-emerald-400" : pick.confidence >= 60 ? "text-accent" : "text-amber-300")}>
            {pick.confidence}%
          </span>
        )}
        {pick.matchTime && <span>{formatDateET(pick.matchTime)}</span>}
      </div>

      {/* Result + Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-white/6 pt-3">
        <div className="flex items-center gap-1">
          <span className="typo-caption text-subtle mr-1">Result:</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Mark won"
            onClick={() => onResult(pick.result === "won" ? "pending" : "won")}
            className={cn("size-7", pick.result === "won" ? "text-emerald-400 bg-emerald-500/15" : "text-zinc-500 hover:text-emerald-400")}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5"><path d="M3 8.5l3.5 3.5 6.5-7" /></svg>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Mark lost"
            onClick={() => onResult(pick.result === "lost" ? "pending" : "lost")}
            className={cn("size-7", pick.result === "lost" ? "text-rose-400 bg-rose-500/15" : "text-zinc-500 hover:text-rose-400")}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          <Button type="button" size="sm" onClick={onView} className="h-8 gap-1.5 border border-transparent bg-[#c75931] text-white hover:bg-[#b54f2a]">
            <Eye className="size-3.5" /> View
          </Button>
          <Button type="button" size="icon" variant="outline" aria-label="Edit" onClick={onEdit} className="size-8 border-white/12 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white">
            <Pencil className="size-3.5" />
          </Button>
          <Button type="button" size="icon" variant="outline" aria-label="Delete" onClick={onDelete} className="size-8 border-white/12 bg-white/5 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */

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
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pickToDelete, setPickToDelete] = React.useState<AdminPick | null>(null);
  const [deleting, setDeleting] = React.useState(false);

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

  const handleDelete = (pick: AdminPick) => {
    setPickToDelete(pick);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pickToDelete) return;
    setDeleting(true);
    try {
      await deleteAdminPick(pickToDelete._id);
      toast.success("Pick deleted");
      setDeleteDialogOpen(false);
      setPickToDelete(null);
      lastKeyRef.current = null;
      fetchPicks(page, debouncedSearch, leagueFilter);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Failed to delete pick");
    } finally {
      setDeleting(false);
    }
  };

  const handleResultChange = async (pick: AdminPick, result: "won" | "lost" | "pending") => {
    try {
      await updateAdminPick(pick._id, { result });
      toast.success(`Marked as ${result}`);
      lastKeyRef.current = null;
      fetchPicks(page, debouncedSearch, leagueFilter);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Failed to update result");
    }
  };

  const handleStatusChange = async (pick: AdminPick, active: boolean) => {
    try {
      const status: PickStatus = active ? "active" : "inactive";
      await updateAdminPick(pick._id, { status });
      toast.success(`Pick marked as ${status}`);
      lastKeyRef.current = null;
      fetchPicks(page, debouncedSearch, leagueFilter);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Failed to update status");
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

      <div className="flex flex-1 flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 md:px-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="typo-heading-lg text-white">Pick management</h1>
            <p className="mt-1 typo-body-sm sm:typo-body-md text-subtle">
              {isHandicapper
                ? "Create and edit your picks with game info, analysis, odds, bet type, and confidence."
                : "Create picks with game info, analysis, odds, bet type, and confidence."}
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreate}
            className="w-full bg-accent text-slate-950 hover:brightness-105 sm:w-auto"
          >
            <Plus className="mr-2 size-4" />
            Upload pick
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
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
          <div className="flex items-center gap-2">
            <LeagueFilterSelect value={leagueFilter} onChange={setLeagueFilter} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh"
              className="ml-auto h-9 gap-2 border-white/12 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white sm:ml-0"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-rose-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <p className="typo-body-sm font-medium">Couldn&apos;t load picks</p>
              <p className="typo-caption text-rose-200/80">{error}</p>
            </div>
          </div>
        ) : null}

        {/* ── Mobile Card Layout ── */}
        <section className="lg:hidden">
          {loading && !data ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl bg-white/10" />
              ))}
            </div>
          ) : data && data.picks.length > 0 ? (
            <div className="space-y-3">
              {data.picks.map((pick) => (
                <PickCard
                  key={pick._id}
                  pick={pick}
                  onView={() => setViewPick(pick)}
                  onEdit={() => openEdit(pick)}
                  onDelete={() => handleDelete(pick)}
                  onResult={(r) => handleResultChange(pick, r)}
                  onStatus={(active) => handleStatusChange(pick, active)}
                />
              ))}
            </div>
          ) : !loading && !error ? (
            <p className="py-10 text-center typo-body-sm text-subtle">
              {debouncedSearch || leagueFilter !== "all"
                ? "No picks match the current filters."
                : "No picks yet. Upload your first pick."}
            </p>
          ) : null}
        </section>

        {/* ── Desktop Table Layout ── */}
        <section className="hidden overflow-x-auto lg:block">
          <Table className="text-slate-100">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">League</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Matchup</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Pick title</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Access</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Bet type</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Odds</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Confidence</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Match time</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Posted</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Status</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">Result</TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-right text-subtle">Actions</TableHead>
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
                  <TableRow key={pick._id} className="border-white/5 transition hover:bg-white/4">
                    <TableCell>
                      {pick.league ? (
                        <span className="inline-flex items-center gap-2.5">
                          <LeagueLogo league={pick.league} size={22} />
                          <span className="typo-body-sm font-medium text-white">{pick.league}</span>
                        </span>
                      ) : (
                        <span className="typo-body-sm text-subtle">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-60 whitespace-normal">
                      <MatchupDisplay pick={pick} logoSize={16} />
                    </TableCell>
                    <TableCell className="max-w-50 whitespace-normal">
                      <p className="line-clamp-2 typo-body-sm font-medium text-white">{pick.pickTitle}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold", accessBadgeClass(pickAccess(pick)))}>
                        {PICK_ACCESS_LABELS[pickAccess(pick)]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold", betTypeBadgeClass())}>
                        {BET_TYPE_LABELS[pick.betType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="typo-body-sm tabular-nums text-white">{pick.odds}</TableCell>
                    <TableCell>
                      {pick.confidence ? (
                        <Badge className={cn("rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold tabular-nums", confidenceBadgeClass(pick.confidence))}>
                          {pick.confidence}%
                        </Badge>
                      ) : (
                        <span className="text-subtle">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {pick.matchTime ? (
                        <>
                          <p className="typo-body-sm text-white">{formatDateET(pick.matchTime)}</p>
                          <p className="typo-caption text-subtle">{formatDateTimeET(pick.matchTime).split(',')[1]}</p>
                        </>
                      ) : (
                        <p className="typo-caption text-subtle">—</p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="typo-body-sm text-white">{formatDateET(pick.createdAt)}</p>
                      <p className="typo-caption text-subtle">{authorName(pick)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xs font-medium", pick.status === "active" ? "text-emerald-400" : "text-zinc-400")}>
                          {pick.status === "active" ? "Active" : "Inactive"}
                        </span>
                        <Switch
                          checked={pick.status === "active"}
                          onCheckedChange={(checked) =>
                            handleStatusChange(pick, checked)
                          }
                          aria-label="Toggle status"
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xs font-medium", pick.result === "won" ? "text-emerald-400" : "text-rose-400")}>
                          {pick.result === "won" ? "Win" : "Loss"}
                        </span>
                        <Switch
                          checked={pick.result === "won"}
                          onCheckedChange={(checked) =>
                            handleResultChange(pick, checked ? "won" : "lost")
                          }
                          aria-label="Toggle result"
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 border-white/12 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                          >
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setViewPick(pick)}>
                            <Eye className="mr-2 size-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(pick)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(pick)}
                            className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : !loading && !error ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell colSpan={COLUMN_COUNT} className="py-10 text-center typo-body-sm text-subtle">
                    {debouncedSearch || leagueFilter !== "all"
                      ? "No picks match the current filters."
                      : "No picks yet. Upload your first pick."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </section>

        {/* Pagination */}
        <div className="flex flex-col items-center gap-3 border-t border-white/10 px-3 py-3 sm:flex-row sm:justify-between sm:px-5">
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
              <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Prev</span>
            </Button>
            <span className="typo-caption text-slate-300">
              <span className="font-semibold text-white">{data?.page ?? page}</span>
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
              <span className="hidden sm:inline">Next</span> <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <PickFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        pick={editPick}
        role={role}
        onSaved={() => {
          lastKeyRef.current = null;
          fetchPicks(page, debouncedSearch, leagueFilter);
        }}
      />

      {/* View Pick Dialog */}
      <Dialog open={Boolean(viewPick)} onOpenChange={(o) => !o && setViewPick(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto border border-white/10 bg-linear-to-br from-[#0f0f0f] to-[#1a1a1a] p-0 text-slate-100 sm:max-w-xl">
          {viewPick ? (
            <>
              {/* Header */}
              <div className="border-b border-white/10 bg-linear-to-r from-accent/10 to-transparent px-4 py-5 sm:px-6 sm:py-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DialogTitle className="text-xl font-bold leading-tight text-white sm:text-2xl">
                        {viewPick.pickTitle}
                      </DialogTitle>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge className="border border-accent/40 bg-accent/20 px-3 py-1 text-sm text-accent">
                          {viewPick.league}
                        </Badge>
                        <Badge className={cn("rounded-full border-transparent px-3 py-1 text-xs font-semibold", accessBadgeClass(pickAccess(viewPick)))}>
                          {PICK_ACCESS_LABELS[pickAccess(viewPick)]}
                        </Badge>
                        <Badge className={cn("rounded-full border-transparent px-3 py-1 text-xs font-semibold", statusBadgeClass(pickStatus(viewPick)))}>
                          {PICK_STATUS_LABELS[pickStatus(viewPick)]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matchup & Quick Info */}
              <div className="border-b border-white/10 px-4 py-5 sm:px-6">
                <div className="mb-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Matchup</p>
                  <div className="flex items-center justify-center gap-6 py-4">
                    <MatchupDisplay pick={viewPick} logoSize={48} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Bet Type</p>
                    <p className="mt-2 text-sm font-medium text-white">{BET_TYPE_LABELS[viewPick.betType]}</p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Odds</p>
                    <p className="mt-2 text-sm font-medium text-accent">{viewPick.odds}</p>
                  </div>
                  <div className="flex flex-col rounded-lg border border-white/5 bg-white/5 p-3">
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

              {/* Analysis */}
              <div className="border-b border-white/10 px-4 py-5 sm:px-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Expert Analysis</p>
                <div className="rounded-lg border border-white/5 bg-white/3 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                    {viewPick.detailedAnalysis}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="border-b border-white/10 px-4 py-5 sm:px-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Timeline</p>
                <div className="space-y-3">
                  {viewPick.matchTime ? (
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 size-5 shrink-0 text-blue-400" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Match Time</p>
                        <p className="mt-1 text-sm text-white">{formatDateTimeET(viewPick.matchTime)}</p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-5 shrink-0 text-zinc-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Posted</p>
                      <p className="mt-1 text-sm text-white">{formatDateTimeET(viewPick.createdAt)}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">by {authorName(viewPick)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 bg-white/2 px-4 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  onClick={() => setViewPick(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="bg-accent font-medium text-slate-950 hover:brightness-110"
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
          <DialogDescription className="sr-only">Pick details</DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-white/10 bg-[#0c0c0c] sm:max-w-md">
          <DialogTitle className="text-xl font-bold text-white">
            Delete Pick
          </DialogTitle>
          <DialogDescription className="text-subtle">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              "{pickToDelete?.pickTitle}"
            </span>
            ? This action cannot be undone.
          </DialogDescription>
          <div className="flex gap-3 pt-4 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-400 hover:bg-white/5 hover:text-slate-200"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
