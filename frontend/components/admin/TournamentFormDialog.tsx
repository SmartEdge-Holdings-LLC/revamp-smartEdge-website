"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogOverlayContainerContext } from "@/components/ui/dialog-overlay-container";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AdminApiError,
  createAdminTournament,
  listAdminPicks,
  updateAdminTournament,
} from "@/lib/api/adminApi";
import { cn } from "@/lib/utils";
import type {
  AdminTournament,
  CreateTournamentPayload,
  PrizeType,
  TournamentStatus,
} from "@/types/tournaments";
import type { AdminPick } from "@/types/picks";

const fieldClass =
  "h-9 border-white/12 bg-white/5 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25";

const labelClass =
  "block typo-caption font-semibold uppercase tracking-[0.12em] text-subtle";

type FormState = {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  status: TournamentStatus;
  prizeType: PrizeType;
  prizeValue: string;
  prizeDescription: string;
  gameIds: string[];
};

const emptyForm = (): FormState => ({
  name: "",
  startDate: undefined,
  endDate: undefined,
  status: "inactive",
  prizeType: "discount",
  prizeValue: "10",
  prizeDescription: "",
  gameIds: [],
});

function tournamentToForm(t: AdminTournament): FormState {
  return {
    name: t.name,
    startDate: new Date(t.startDate),
    endDate: new Date(t.endDate),
    status: t.status,
    prizeType: t.prize.type,
    prizeValue: String(t.prize.value),
    prizeDescription: t.prize.description ?? "",
    gameIds: [...t.gameIds],
  };
}

const triggerClass =
  "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-white/12 bg-white/5 px-3 py-2 typo-body-sm text-slate-100 shadow-sm outline-none transition-colors hover:border-white/20 focus-visible:border-accent/55 focus-visible:ring-1 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50";

function PopoverSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-1.5">
      <span className={labelClass}>{label}</span>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild disabled={disabled}>
          <button type="button" className={triggerClass}>
            <span className="truncate font-medium leading-none">
              {selected?.label ?? "Select…"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-subtle opacity-80" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={4}
          className="z-200 w-(--radix-popover-trigger-width) border-white/10 bg-zinc-950/95 p-1 text-slate-100 shadow-2xl backdrop-blur-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ul role="listbox" className="flex flex-col gap-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "relative flex w-full cursor-pointer items-center rounded-md py-2 pr-8 pl-2 text-left text-sm text-slate-200 outline-none",
                      "hover:bg-white/10 focus:bg-white/10 focus:text-white",
                      isSelected && "bg-white/10 text-white"
                    )}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <span className="font-medium leading-none">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check className="absolute right-2 size-4 text-accent" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
  disabled,
  container,
}: {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  container: HTMLElement | null;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <span className={labelClass}>{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              fieldClass,
              !value && "text-subtle"
            )}
          >
            <CalendarIcon className="mr-2 size-4 text-subtle" />
            {value ? format(value, "MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-white/10 bg-zinc-950"
          align="start"
          container={container}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={(day) => {
              onChange(day);
              setOpen(false);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface TournamentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament?: AdminTournament | null;
  onSaved: () => void;
}

export function TournamentFormDialog({
  open,
  onOpenChange,
  tournament,
  onSaved,
}: TournamentFormDialogProps) {
  const isEdit = Boolean(tournament?.id);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);
  const [dialogContainer, setDialogContainer] =
    React.useState<HTMLElement | null>(null);
  const [availablePicks, setAvailablePicks] = React.useState<AdminPick[]>([]);
  const [picksLoading, setPicksLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (tournament) {
      setForm(tournamentToForm(tournament));
    } else {
      setForm(emptyForm());
    }
  }, [open, tournament]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPicksLoading(true);
    listAdminPicks({ limit: 100, page: 1, access: ["tournament"] })
      .then((res) => {
        if (!cancelled) setAvailablePicks(res.picks);
      })
      .catch(() => {
        if (!cancelled) setAvailablePicks([]);
      })
      .finally(() => {
        if (!cancelled) setPicksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const toggleGame = (pickId: string) => {
    setForm((prev) => ({
      ...prev,
      gameIds: prev.gameIds.includes(pickId)
        ? prev.gameIds.filter((id) => id !== pickId)
        : [...prev.gameIds, pickId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Start and end dates are required");
      return;
    }
    const prizeValue = Number(form.prizeValue);
    if (!Number.isFinite(prizeValue) || prizeValue < 0) {
      toast.error("Prize value must be a positive number");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateTournamentPayload = {
        name,
        startDate: form.startDate.toISOString(),
        endDate: form.endDate.toISOString(),
        status: form.status,
        gameIds: form.gameIds,
        prize: {
          type: form.prizeType,
          value: prizeValue,
          description: form.prizeDescription.trim() || undefined,
        },
      };

      if (isEdit && tournament) {
        await updateAdminTournament(tournament.id, payload);
        toast.success("Tournament updated");
      } else {
        await createAdminTournament(payload);
        toast.success("Tournament created");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to save tournament";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const prizeValueLabel = (type: PrizeType) => {
    switch (type) {
      case "discount":
        return "Discount %";
      case "freeMonth":
        return "Free months";
      case "custom":
        return "Value";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setDialogContainer}
        className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden border-white/10 bg-[#0c0c0c] p-0 text-slate-100"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogOverlayContainerContext.Provider value={dialogContainer}>
          <DialogTitle className="px-5 pt-4 typo-heading-md text-white">
            {isEdit ? "Edit tournament" : "Create tournament"}
          </DialogTitle>
          <DialogDescription className="px-5 typo-body-sm text-subtle">
            {isEdit
              ? "Update tournament details, games, or prize."
              : "Set up a new tournament with games and prizes for members."}
          </DialogDescription>

          <form
            className="space-y-4 overflow-y-auto px-5 pb-5 pt-4"
            onSubmit={handleSubmit}
          >
            {/* Name */}
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="t-name">
                Name
              </label>
              <Input
                id="t-name"
                className={fieldClass}
                placeholder="June MLB Challenge"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={submitting}
                required
              />
            </div>

            {/* Dates — shadcn Calendar popovers */}
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePickerField
                label="Start date"
                value={form.startDate}
                onChange={(d) => setForm((p) => ({ ...p, startDate: d }))}
                disabled={submitting}
                container={dialogContainer}
              />
              <DatePickerField
                label="End date"
                value={form.endDate}
                onChange={(d) => setForm((p) => ({ ...p, endDate: d }))}
                disabled={submitting}
                container={dialogContainer}
              />
            </div>

            {/* Status */}
            <PopoverSelect<TournamentStatus>
              label="Status"
              value={form.status}
              onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              disabled={submitting}
              options={[
                { value: "inactive", label: "Inactive" },
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
              ]}
            />

            {/* Prize */}
            <div className="grid gap-4 sm:grid-cols-3">
              <PopoverSelect<PrizeType>
                label="Prize type"
                value={form.prizeType}
                onChange={(v) => setForm((p) => ({ ...p, prizeType: v }))}
                disabled={submitting}
                options={[
                  { value: "discount", label: "Discount" },
                  { value: "freeMonth", label: "Free Month" },
                  { value: "custom", label: "Custom" },
                ]}
              />
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="t-prize-value">
                  {prizeValueLabel(form.prizeType)}
                </label>
                <Input
                  id="t-prize-value"
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={form.prizeValue}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, prizeValue: e.target.value }))
                  }
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="t-prize-desc">
                  Description
                </label>
                <Input
                  id="t-prize-desc"
                  className={fieldClass}
                  placeholder="e.g. 25% off next month"
                  value={form.prizeDescription}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      prizeDescription: e.target.value,
                    }))
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Games selector */}
            <div className="space-y-2 rounded-lg border border-white/10 bg-white/2 p-3">
              <p className={labelClass}>
                Games / Picks ({form.gameIds.length} selected)
              </p>
              <p className="typo-caption text-subtle">
                Select the picks/games that are part of this tournament.
              </p>

              {picksLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-subtle" />
                </div>
              ) : availablePicks.length === 0 ? (
                <p className="py-3 text-center typo-caption text-subtle">
                  No picks available. Create picks first.
                </p>
              ) : (
                <ul className="max-h-48 space-y-1 overflow-y-auto">
                  {availablePicks.map((pick) => {
                    const selected = form.gameIds.includes(pick._id);
                    return (
                      <li key={pick._id}>
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left typo-body-sm transition",
                            selected
                              ? "bg-accent/15 text-white ring-1 ring-inset ring-accent/30"
                              : "hover:bg-white/6 text-slate-300"
                          )}
                          onClick={() => toggleGame(pick._id)}
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded border",
                              selected
                                ? "border-accent bg-accent text-slate-950"
                                : "border-white/20 bg-white/5"
                            )}
                          >
                            {selected && (
                              <svg
                                viewBox="0 0 12 12"
                                className="size-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            )}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {pick.game || pick.pickTitle}
                          </span>
                          <span className="shrink-0 rounded bg-white/8 px-1.5 py-0.5 typo-caption text-subtle">
                            {pick.league}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
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
                {submitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isEdit ? "Save changes" : "Create tournament"}
              </Button>
            </DialogFooter>
          </form>
        </DialogOverlayContainerContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
