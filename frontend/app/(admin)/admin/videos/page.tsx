"use client";

import * as React from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { VideoFormDialog } from "@/components/admin/VideoFormDialog";
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
  AdminApiError,
  deleteAdminVideo,
  listAdminVideos,
} from "@/lib/api/adminApi";
import { formatDateET } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { AdminVideo, ListVideosResponse, VideoPlatform, VideoStatus } from "@/types/videos";
import { VIDEO_PLATFORM_LABELS, VIDEO_STATUS_LABELS } from "@/types/videos";

const PAGE_SIZE = 20;
const COLUMN_COUNT = 7;

function authorName(video: AdminVideo) {
  const cb = video.createdBy;
  if (typeof cb === "object" && cb !== null && "name" in cb) {
    return cb.name;
  }
  return "—";
}

function platformBadgeClass(platform: VideoPlatform) {
  switch (platform) {
    case "youtube":
      return "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-400/25";
    case "tiktok":
      return "bg-zinc-500/10 text-zinc-200 ring-1 ring-inset ring-zinc-400/25";
    default:
      return "bg-fuchsia-500/10 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-400/25";
  }
}

function statusBadgeClass(status: VideoStatus) {
  return status === "active"
    ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25"
    : "bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/20";
}

function videoStatus(video: AdminVideo): VideoStatus {
  return video.status === "inactive" ? "inactive" : "active";
}

export default function AdminVideosPage() {
  const [data, setData] = React.useState<ListVideosResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editVideo, setEditVideo] = React.useState<AdminVideo | null>(null);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchVideos = React.useCallback(async (targetPage: number, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminVideos({
        page: targetPage,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setData(result);
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load videos";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshKey = `${page}|${debouncedSearch}`;
  const lastKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastKeyRef.current === refreshKey) return;
    lastKeyRef.current = refreshKey;
    fetchVideos(page, debouncedSearch);
  }, [fetchVideos, page, debouncedSearch, refreshKey]);

  const handleRefresh = () => {
    lastKeyRef.current = null;
    fetchVideos(page, debouncedSearch);
  };

  const openCreate = () => {
    setEditVideo(null);
    setFormOpen(true);
  };

  const openEdit = (video: AdminVideo) => {
    setEditVideo(video);
    setFormOpen(true);
  };

  const handleDelete = async (video: AdminVideo) => {
    const label = video.title || VIDEO_PLATFORM_LABELS[video.platform];
    if (!confirm(`Remove video "${label}"?`)) return;
    try {
      await deleteAdminVideo(video._id);
      toast.success("Video removed");
      lastKeyRef.current = null;
      fetchVideos(page, debouncedSearch);
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Failed to delete video");
    }
  };

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const showingFrom = data ? (data.page - 1) * data.limit + 1 : 0;
  const showingTo = data ? Math.min(data.page * data.limit, data.total) : 0;

  return (
    <>
      <AdminHeader
        title="Videos"
        subtitle="YouTube, TikTok, and Instagram links for members"
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="typo-heading-lg text-white">Video library</h1>
            <p className="mt-1 typo-body-md text-subtle">
              Add links to your YouTube videos, TikTok posts, or Instagram reels. Active videos
              appear on the public feed.
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreate}
            className="bg-accent text-slate-950 hover:brightness-105"
          >
            <Plus className="mr-2 size-4" />
            Add video
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title, URL, or platform…"
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
                <p className="typo-body-sm font-medium">Couldn&apos;t load videos</p>
                <p className="typo-caption text-rose-200/80">{error}</p>
              </div>
            </div>
          ) : null}

          <Table className="text-slate-100">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Platform
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Title
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Link
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Status
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Added
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-subtle">
                  Order
                </TableHead>
                <TableHead className="typo-caption uppercase tracking-[0.12em] text-right text-subtle">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/5">
              {loading && !data ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skel-${i}`} className="border-white/5 hover:bg-transparent">
                    {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                      <TableCell key={`skel-${i}-${j}`}>
                        <Skeleton className="h-4 w-24 bg-white/10" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data && data.videos.length > 0 ? (
                data.videos.map((video) => (
                  <TableRow
                    key={video._id}
                    className="border-white/5 transition hover:bg-white/4"
                  >
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          platformBadgeClass(video.platform)
                        )}
                      >
                        {VIDEO_PLATFORM_LABELS[video.platform]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] whitespace-normal">
                      <p className="line-clamp-2 typo-body-sm font-medium text-white">
                        {video.title || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 truncate typo-caption text-accent hover:underline"
                      >
                        <span className="truncate">{video.url}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full border-transparent px-2 py-0.5 typo-caption font-semibold",
                          statusBadgeClass(videoStatus(video))
                        )}
                      >
                        {VIDEO_STATUS_LABELS[videoStatus(video)]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <p className="typo-body-sm text-white">{formatDateET(video.createdAt)}</p>
                      <p className="typo-caption text-subtle">{authorName(video)}</p>
                    </TableCell>
                    <TableCell className="typo-body-sm tabular-nums text-white">
                      {video.sortOrder}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {video.embedUrl ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            aria-label="Preview embed"
                            className="size-8 border-white/12 bg-white/5 text-slate-300 hover:bg-white/10"
                            asChild
                          >
                            <a href={video.embedUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="size-3.5" />
                            </a>
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          aria-label="Edit video"
                          onClick={() => openEdit(video)}
                          className="size-8 border-white/12 bg-white/5 text-slate-300 hover:bg-white/10"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          aria-label="Delete video"
                          onClick={() => handleDelete(video)}
                          className="size-8 border-white/12 bg-white/5 text-rose-300 hover:bg-rose-500/10"
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
                    {debouncedSearch
                      ? "No videos match your search."
                      : "No videos yet. Add your first YouTube, TikTok, or Instagram link."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
            <p className="typo-caption text-subtle">
              {data && data.videos.length > 0
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

      <VideoFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        video={editVideo}
        onSaved={() => {
          lastKeyRef.current = null;
          fetchVideos(page, debouncedSearch);
        }}
      />
    </>
  );
}
