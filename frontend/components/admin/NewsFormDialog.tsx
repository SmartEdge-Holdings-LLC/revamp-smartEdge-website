"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminApiError,
  createAdminNews,
  updateAdminNews,
  type AdminNews,
} from "@/lib/api/newsApi";
import { cn } from "@/lib/utils";

interface NewsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  news: AdminNews | null;
  onSaved: () => void;
}

const fieldClass =
  "h-9 border-white/12 bg-white/5 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25";

const labelClass =
  "block typo-caption font-semibold uppercase tracking-[0.12em] text-subtle";

export function NewsFormDialog({
  open,
  onOpenChange,
  news,
  onSaved,
}: NewsFormDialogProps) {
  const isEdit = Boolean(news?._id);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [cta, setCta] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (news) {
        setTitle(news.title);
        setDescription(news.description || "");
        setCta(news.cta || "");
      } else {
        setTitle("");
        setDescription("");
        setCta("");
      }
    }
  }, [open, news]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const titleTrimmed = title.trim();
    const descriptionTrimmed = description.trim();
    const ctaTrimmed = cta.trim();

    if (!titleTrimmed) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && news) {
        await updateAdminNews(news._id, {
          title: titleTrimmed,
          description: descriptionTrimmed || undefined,
          cta: ctaTrimmed || undefined,
        });
        toast.success("News updated");
      } else {
        await createAdminNews({
          title: titleTrimmed,
          description: descriptionTrimmed || undefined,
          cta: ctaTrimmed || undefined,
        });
        toast.success("News created");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to save news";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden border-white/10 bg-[#0c0c0c] p-0 text-slate-100">
        <DialogTitle className="px-5 pt-4 typo-heading-md text-white">
          {isEdit ? "Edit news" : "Create news"}
        </DialogTitle>
        <DialogDescription className="px-5 typo-body-sm text-subtle">
          {isEdit ? "Update the news details." : "Add a new news item with a link."}
        </DialogDescription>

        <form className="space-y-4 overflow-y-auto px-5 pb-5 pt-4" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              className={fieldClass}
              placeholder="News title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="description">
              Description <span className="text-zinc-500">(Optional)</span>
            </label>
            <Textarea
              id="description"
              className={cn(fieldClass, "h-24 resize-none")}
              placeholder="News description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={1000}
            />
            <p className="text-xs text-subtle">{description.length}/1000</p>
          </div>

          {/* CTA Link */}
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="cta">
              CTA Link <span className="text-zinc-500">(Optional)</span>
            </label>
            <Input
              id="cta"
              className={fieldClass}
              placeholder="https://example.com"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              disabled={submitting}
              type="url"
              maxLength={500}
            />
            <p className="text-xs text-subtle">Enter a full URL (e.g., https://example.com)</p>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              className="text-subtle hover:text-white"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent text-slate-950 hover:brightness-105"
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create news"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
