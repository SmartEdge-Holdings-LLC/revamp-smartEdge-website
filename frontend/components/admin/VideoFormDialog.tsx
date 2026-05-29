"use client";

import * as React from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { VideoStatusSelect } from "@/components/admin/VideoStatusSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogOverlayContainerContext } from "@/components/ui/dialog-overlay-container";
import { Input } from "@/components/ui/input";
import {
  AdminApiError,
  createAdminVideo,
  updateAdminVideo,
} from "@/lib/api/adminApi";
import { cn } from "@/lib/utils";
import { VIDEO_PLATFORM_LABELS, type AdminVideo, type CreateVideoPayload } from "@/types/videos";

const fieldClass =
  "h-9 border-white/12 bg-white/5 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25";

const emptyForm = (): CreateVideoPayload => ({
  url: "",
  title: "",
  status: "active",
  sortOrder: 0,
});

function videoToForm(video: AdminVideo): CreateVideoPayload {
  return {
    url: video.url,
    title: video.title ?? "",
    status: video.status ?? "active",
    sortOrder: video.sortOrder ?? 0,
  };
}

interface VideoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: AdminVideo | null;
  onSaved: () => void;
}

export function VideoFormDialog({ open, onOpenChange, video, onSaved }: VideoFormDialogProps) {
  const isEdit = Boolean(video?._id);
  const [form, setForm] = React.useState<CreateVideoPayload>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [dialogContainer, setDialogContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(video ? videoToForm(video) : emptyForm());
  }, [open, video]);

  const update = <K extends keyof CreateVideoPayload>(key: K, value: CreateVideoPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url.trim()) {
      toast.error("Paste a video link");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        title: form.title?.trim() ?? "",
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (isEdit && video) {
        await updateAdminVideo(video._id, payload);
        toast.success("Video updated");
      } else {
        await createAdminVideo(payload);
        toast.success("Video added");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof AdminApiError ? err.message : "Failed to save video");
    } finally {
      setSubmitting(false);
    }
  };

  const previewEmbed =
    isEdit && video?.embedUrl ? (
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40">
        <div className="aspect-video w-full">
          <iframe
            src={video.embedUrl}
            title="YouTube preview"
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setDialogContainer}
        className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden border-white/8 bg-[#0a0a0a] p-0 text-slate-100"
      >
        <DialogOverlayContainerContext.Provider value={dialogContainer}>
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-white/8 px-5 py-4">
              <DialogTitle className="text-[15px] font-semibold text-white">
                {isEdit ? "Edit video" : "Add video"}
              </DialogTitle>
              <DialogDescription className="mt-1 typo-caption text-subtle">
                Paste a public YouTube, TikTok, or Instagram reel link. Platform is detected
                automatically.
              </DialogDescription>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <Field label="Video URL" id="video-url">
                <Input
                  id="video-url"
                  required
                  type="url"
                  value={form.url}
                  onChange={(e) => update("url", e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className={fieldClass}
                />
                <p className="mt-1.5 typo-caption text-subtle">
                  Supports youtube.com, youtu.be, tiktok.com, and instagram.com reels/posts.
                </p>
              </Field>

              <Field label="Title (optional)" id="video-title">
                <Input
                  id="video-title"
                  value={form.title ?? ""}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Week 12 NFL breakdown"
                  className={fieldClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Status" id="video-status">
                  <VideoStatusSelect
                    id="video-status"
                    value={form.status}
                    onChange={(v) => update("status", v)}
                  />
                </Field>
                <Field label="Sort order" id="video-sort">
                  <Input
                    id="video-sort"
                    type="number"
                    min={0}
                    max={9999}
                    value={form.sortOrder ?? 0}
                    onChange={(e) => update("sortOrder", parseInt(e.target.value, 10) || 0)}
                    className={fieldClass}
                  />
                </Field>
              </div>

              {isEdit && video ? (
                <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2.5 typo-caption text-subtle">
                  <span className="font-medium text-zinc-300">Platform:</span>{" "}
                  {VIDEO_PLATFORM_LABELS[video.platform]}
                  {video.externalId ? (
                    <>
                      {" "}
                      · <span className="font-medium text-zinc-300">ID:</span> {video.externalId}
                    </>
                  ) : null}
                </div>
              ) : null}

              {previewEmbed}

              {isEdit && video?.url ? (
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 typo-caption text-accent hover:underline"
                >
                  Open original link
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>

            <DialogFooter className="shrink-0 border-t border-white/8 px-5 py-4 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-accent text-slate-950 hover:brightness-105"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Add video"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogOverlayContainerContext.Provider>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="typo-caption font-medium text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}
