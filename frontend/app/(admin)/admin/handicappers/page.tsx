"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import {
  AlertCircle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  ListFilter,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminApiError, listJonahUsers } from "@/lib/api/adminApi";
import { formatDateET, formatYmdAsDateET } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/types";
import type { JonahUserListItem, JonahUsersResponse } from "@/types/admin";

const PAGE_SIZE = 20;
const COLUMN_COUNT = 8;

const STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past due" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
];

function ymdToDate(s: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const [y, m, d] = s.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

function dateToYmd(d: Date | undefined): string {
  if (!d || Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function prettyDate(d: Date): string {
  return formatYmdAsDateET(dateToYmd(d));
}

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

function planBadgeClass(plan: string) {
  switch (plan) {
    case "pro":
      return "bg-accent/15 text-accent ring-1 ring-accent/30";
    case "enterprise":
      return "bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/30";
    case "starter":
      return "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30";
    default:
      return "bg-white/10 text-slate-200 ring-1 ring-white/15";
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25";
    case "trialing":
      return "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-400/25";
    case "past_due":
      return "bg-amber-500/12 text-amber-300 ring-1 ring-inset ring-amber-400/30";
    case "unpaid":
      return "bg-rose-500/12 text-rose-300 ring-1 ring-inset ring-rose-400/35";
    case "canceled":
      return "bg-zinc-500/10 text-zinc-300 ring-1 ring-inset ring-zinc-400/20";
    default:
      return "bg-white/5 text-subtle ring-1 ring-inset ring-white/10";
  }
}

function FilterChip({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-accent py-1 pl-2.5 pr-1 typo-caption text-accent-foreground">
      <span className="opacity-80">{label}:</span>
      <span className="font-medium">{value}</span>
      <button
        type="button"
        aria-label={`Remove ${label.toLowerCase()} filter`}
        onClick={onRemove}
        className="inline-flex size-5 items-center justify-center rounded-full text-accent-foreground/80 transition hover:bg-black/20 hover:text-accent-foreground"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

export default function HandicappersPage() {
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStatuses, setSelectedStatuses] = React.useState<Set<SubscriptionStatus>>(
    () => new Set()
  );
  const [joinedFrom, setJoinedFrom] = React.useState("");
  const [joinedTo, setJoinedTo] = React.useState("");
  const [data, setData] = React.useState<JonahUsersResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<JonahUserListItem | null>(null);

  const statusFilter = React.useMemo<SubscriptionStatus[]>(
    () =>
      STATUS_OPTIONS.filter((opt) => selectedStatuses.has(opt.value)).map((opt) => opt.value),
    [selectedStatuses]
  );
  const statusKey = statusFilter.join(",");

  const dateRange = React.useMemo(() => {
    const isValidYmd = (s: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s).getTime());
    let from = isValidYmd(joinedFrom) ? joinedFrom : "";
    let to = isValidYmd(joinedTo) ? joinedTo : "";
    if (from && to && from > to) {
      [from, to] = [to, from];
    }
    return { from, to };
  }, [joinedFrom, joinedTo]);
  const dateKey = `${dateRange.from}|${dateRange.to}`;

  const toggleStatus = React.useCallback((value: SubscriptionStatus, checked: boolean) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (checked) next.add(value);
      else next.delete(value);
      return next;
    });
  }, []);

  const fetchSubscribers = React.useCallback(
    async (
      targetPage: number,
      search: string,
      status: SubscriptionStatus[],
      range: { from: string; to: string }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listJonahUsers({
          page: targetPage,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: status.length > 0 ? status : undefined,
          joinedFrom: range.from || undefined,
          joinedTo: range.to || undefined,
        });
        setData(result);
      } catch (err) {
        const message =
          err instanceof AdminApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to load subscribers";
        setError(message);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusKey, dateKey]);

  const lastFetchedKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const key = `${page}|${debouncedSearch}|${statusKey}|${dateKey}`;
    if (lastFetchedKeyRef.current === key) return;
    lastFetchedKeyRef.current = key;
    fetchSubscribers(page, debouncedSearch, statusFilter, dateRange);
  }, [fetchSubscribers, page, debouncedSearch, statusKey, dateKey, statusFilter, dateRange]);

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const showingFrom = data ? (data.page - 1) * data.limit + 1 : 0;
  const showingTo = data ? Math.min(data.page * data.limit, data.total) : 0;

  const hasActiveFilters =
    debouncedSearch.length > 0 ||
    statusFilter.length > 0 ||
    Boolean(dateRange.from) ||
    Boolean(dateRange.to);

  return (
    <>
      <AdminHeader
        title="Handicappers"
        subtitle={
          data?.products.length
            ? `${data.products.length} Jonah products · ${total.toLocaleString()} subscribers`
            : "Jonah plan subscribers"
        }
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="min-w-0">
          <h1 className="typo-heading-lg text-white">Jonah Subscribers</h1>
          <p className="mt-1 typo-body-md text-subtle">
            Members on Jonah weekly, monthly standard, or monthly VIP plans.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && searchInput) setSearchInput("");
                }}
                placeholder="Search by email…"
                aria-label="Search subscribers by email"
                className="h-9 border-white/12 bg-white/5 pl-9 pr-9 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25"
              />
              {searchInput ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition hover:bg-white/10 hover:text-slate-100"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-2 border-white/12 bg-white/5 px-3 typo-body-sm text-slate-100 hover:bg-white/10 hover:text-white",
                    selectedStatuses.size > 0 && "border-accent/40 text-white"
                  )}
                >
                  <ListFilter className="size-4" />
                  Status
                  {selectedStatuses.size > 0 ? (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 typo-caption font-semibold text-accent-foreground">
                      {selectedStatuses.size}
                    </span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-56 border-white/10 bg-[#0a0a0a] p-1 text-slate-100"
              >
                <div className="flex flex-col">
                  {STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2 py-1.5 transition hover:bg-white/5"
                    >
                      <Checkbox
                        checked={selectedStatuses.has(opt.value)}
                        onCheckedChange={(value) => toggleStatus(opt.value, value === true)}
                        aria-label={`Show ${opt.label.toLowerCase()} subscribers`}
                      />
                      <span className="typo-body-sm text-slate-200">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-2 border-white/12 bg-white/5 px-3 typo-body-sm text-slate-100 hover:bg-white/10 hover:text-white",
                    (dateRange.from || dateRange.to) && "border-accent/40 text-white"
                  )}
                >
                  <CalendarIcon className="size-4" />
                  {(() => {
                    const from = ymdToDate(dateRange.from);
                    const to = ymdToDate(dateRange.to);
                    if (from && to) return `${prettyDate(from)} – ${prettyDate(to)}`;
                    if (from) return `${prettyDate(from)} – …`;
                    if (to) return `… – ${prettyDate(to)}`;
                    return "Joined date";
                  })()}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-auto border-white/10 bg-[#0a0a0a] p-0 text-slate-100"
              >
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  defaultMonth={ymdToDate(dateRange.from) ?? new Date()}
                  selected={{
                    from: ymdToDate(joinedFrom),
                    to: ymdToDate(joinedTo),
                  }}
                  onSelect={(range: DateRange | undefined) => {
                    setJoinedFrom(dateToYmd(range?.from));
                    setJoinedTo(dateToYmd(range?.to));
                  }}
                  disabled={{ after: new Date() }}
                />
                <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!dateRange.from && !dateRange.to}
                    onClick={() => {
                      setJoinedFrom("");
                      setJoinedTo("");
                    }}
                    className="h-7 typo-caption text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    Reset
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                lastFetchedKeyRef.current = null;
                fetchSubscribers(page, debouncedSearch, statusFilter, dateRange);
              }}
              disabled={loading}
              aria-label="Refresh"
              className="h-9 gap-2 border-white/12 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-2">
              {debouncedSearch ? (
                <FilterChip
                  label="Email"
                  value={`"${debouncedSearch}"`}
                  onRemove={() => setSearchInput("")}
                />
              ) : null}
              {STATUS_OPTIONS.filter((opt) => selectedStatuses.has(opt.value)).map((opt) => (
                <FilterChip
                  key={opt.value}
                  label="Status"
                  value={opt.label}
                  onRemove={() => toggleStatus(opt.value, false)}
                />
              ))}
              {dateRange.from || dateRange.to ? (
                <FilterChip
                  label="Joined"
                  value={`${
                    dateRange.from ? prettyDate(ymdToDate(dateRange.from)!) : "…"
                  } → ${dateRange.to ? prettyDate(ymdToDate(dateRange.to)!) : "…"}`}
                  onRemove={() => {
                    setJoinedFrom("");
                    setJoinedTo("");
                  }}
                />
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSelectedStatuses(new Set());
                  setJoinedFrom("");
                  setJoinedTo("");
                }}
                className="typo-caption text-subtle underline-offset-2 transition hover:text-slate-100 hover:underline"
              >
                Clear all
              </button>
            </div>
          ) : null}
        </div>

        <section className="overflow-hidden">
          {error ? (
            <div className="flex items-start gap-3 px-5 py-4 text-rose-200">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="typo-body-sm font-medium">Couldn&apos;t load subscribers</p>
                <p className="typo-caption text-rose-200/80">{error}</p>
              </div>
            </div>
          ) : null}

          <Table className="text-slate-100">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  User
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Jonah product
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Plan
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Status
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Stripe Cust.
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Joined
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Updated
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
              ) : data && data.users.length > 0 ? (
                data.users.map((u) => (
                  <TableRow
                    key={u._id}
                    className="border-white/5 transition hover:bg-white/4"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 typo-caption font-semibold text-slate-100">
                          {initialsOf(u.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate typo-body-sm font-medium text-white">{u.name}</p>
                          <p className="truncate typo-caption text-subtle">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px]">
                      <p className="truncate typo-body-sm text-white">
                        {u.jonahProductName ?? "—"}
                      </p>
                      {u.jonahProductId ? (
                        <p className="truncate font-mono typo-caption text-subtle">
                          {u.jonahProductId}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold capitalize",
                          planBadgeClass(u.currentPlan)
                        )}
                      >
                        {u.currentPlan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold capitalize",
                          statusBadgeClass(u.subscriptionStatus)
                        )}
                      >
                        {u.subscriptionStatus.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate font-mono typo-caption text-white">
                      {u.stripeCustomerId ?? "—"}
                    </TableCell>
                    <TableCell className="typo-body-sm text-white">
                      {formatDateET(u.createdAt)}
                    </TableCell>
                    <TableCell className="typo-body-sm text-white">
                      {formatDateET(u.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedUser(u)}
                        className="h-8 gap-1.5 border border-transparent bg-[#c75931] text-white hover:bg-[#b54f2a] hover:text-white"
                      >
                        <Eye className="size-3.5" />
                        View details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : !loading && !error ? (
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="py-10 text-center typo-body-sm text-subtle"
                  >
                    {hasActiveFilters
                      ? "No subscribers match the current filters."
                      : "No Jonah subscribers found."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
            <p className="typo-caption text-subtle">
              {data && data.users.length > 0
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

      <UserDetailsDialog
        user={selectedUser}
        open={selectedUser !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      />
    </>
  );
}
