"use client";

import * as React from "react";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import { BetTypeSelect } from "@/components/admin/BetTypeSelect";
import { PickAccessMultiToggle } from "@/components/admin/PickAccessMultiToggle";
import { PickStatusSelect } from "@/components/admin/PickStatusSelect";
import { LeagueSelect } from "@/components/admin/LeagueSelect";
import { MatchupSelect } from "@/components/admin/MatchupSelect";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AdminApiError, createAdminPick, listLeagueTeams, updateAdminPick } from "@/lib/api/adminApi";
import {
  findCollegeConferenceForTeam,
  findCollegeTeam,
  getAllCollegeTeams,
  isCollegeFootballLeague,
} from "@/lib/college-football";
import { cn } from "@/lib/utils";
import {
  normalizeBetTypeForLeague,
  type AdminPick,
  type CreatePickPayload,
  type League,
  type LeagueTeam,
  type PickAccess,
} from "@/types/picks";

const fieldClass =
  "h-9 border-white/12 bg-white/5 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25";

const textareaClass = cn(
  fieldClass,
  "min-h-[120px] w-full resize-y rounded-md border px-3 py-2 outline-none focus-visible:ring-1"
);

type PickFormState = Omit<CreatePickPayload, "access"> & {
  customAwayName: string;
  customHomeName: string;
  matchTimeLocal: string;
  hasConfidence: boolean;
  isPickOfDay: boolean;
  access: CreatePickPayload["access"][];
};

const emptyForm = (isHandicapper: boolean): PickFormState => ({
  league: "NBA",
  awayTeamId: "",
  homeTeamId: "",
  useCustomMatchup: false,
  customAwayName: "",
  customHomeName: "",
  pickTitle: "",
  detailedAnalysis: "",
  odds: "",
  betType: "spread",
  confidence: 75,
  access: isHandicapper ? ["jonahvip"] : ["smartedgeVIPPremium"],
  status: "active",
  matchTimeLocal: "",
  hasConfidence: false,
  isPickOfDay: false,
});

function pickToForm(pick: AdminPick): PickFormState {
  const matchTimeLocal = pick.matchTime
    ? new Date(pick.matchTime).toISOString().slice(0, 16)
    : "";

  // Convert single access to array if needed
  const accessArray = Array.isArray(pick.access)
    ? pick.access
    : [pick.access ?? "smartedgeVIPPremium"];

  return {
    league: pick.league ?? "NBA",
    awayTeamId: pick.awayTeamId ?? "",
    homeTeamId: pick.homeTeamId ?? "",
    useCustomMatchup: false,
    customAwayName: pick.awayTeamName ?? "",
    customHomeName: pick.homeTeamName ?? "",
    pickTitle: pick.pickTitle,
    detailedAnalysis: pick.detailedAnalysis,
    odds: pick.odds,
    betType: normalizeBetTypeForLeague(pick.league ?? "NBA", pick.betType),
    confidence: pick.confidence ?? 75,
    access: accessArray,
    status: pick.status ?? "active",
    matchTimeLocal,
    hasConfidence: Boolean(pick.confidence),
    isPickOfDay: Boolean((pick as any).isPickOfDay),
  };
}

interface PickFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pick?: AdminPick | null;
  role?: string; // User role from admin page
  onSaved: () => void;
}

export function PickFormDialog({ open, onOpenChange, pick, role, onSaved }: PickFormDialogProps) {
  const isEdit = Boolean(pick?._id);

  // Determine allowed access types based on user role
  const isHandicapper = role === "handicapper";
  const allowedAccess: PickAccess[] = isHandicapper
    ? ["jonahvip", "jonah-vip-premium", "free"]
    : ["free", "smartedgeVIP", "smartedgeVIPPremium", "tournament"];

  const [form, setForm] = React.useState<PickFormState>(() => emptyForm(isHandicapper));
  const [teams, setTeams] = React.useState<LeagueTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [awayConferenceId, setAwayConferenceId] = React.useState("");
  const [homeConferenceId, setHomeConferenceId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [dialogContainer, setDialogContainer] = React.useState<HTMLElement | null>(null);

  const loadTeamsForLeague = React.useCallback(async (league: League) => {
    if (isCollegeFootballLeague(league)) {
      return getAllCollegeTeams();
    }
    const res = await listLeagueTeams(league);
    return res.teams;
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const nextForm = pick ? pickToForm(pick) : emptyForm(isHandicapper);
    setForm(nextForm);
    setAwayConferenceId(
      pick?.awayTeamId ? findCollegeConferenceForTeam(pick.awayTeamId) ?? "" : ""
    );
    setHomeConferenceId(
      pick?.homeTeamId ? findCollegeConferenceForTeam(pick.homeTeamId) ?? "" : ""
    );

    let cancelled = false;
    setTeamsLoading(true);
    loadTeamsForLeague(nextForm.league)
      .then((loaded) => {
        if (!cancelled) setTeams(loaded);
      })
      .catch((err) => {
        if (!cancelled) {
          setTeams([]);
          toast.error(
            err instanceof AdminApiError ? err.message : "Could not load teams"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setTeamsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, pick, loadTeamsForLeague]);

  const update = <K extends keyof PickFormState>(key: K, value: PickFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  React.useEffect(() => {
    if (!open || !pick || teamsLoading) return;
    const awayFound = teams.some((t) => t.id === pick.awayTeamId);
    const homeFound = teams.some((t) => t.id === pick.homeTeamId);
    if (!awayFound || !homeFound) {
      setForm((prev) => ({
        ...prev,
        useCustomMatchup: true,
        customAwayName: pick.awayTeamName ?? prev.customAwayName,
        customHomeName: pick.homeTeamName ?? prev.customHomeName,
        awayTeamId: "",
        homeTeamId: "",
      }));
      setAwayConferenceId("");
      setHomeConferenceId("");
    }
  }, [open, pick, teams, teamsLoading]);

  const handleLeagueChange = (league: League) => {
    setForm((prev) => ({
      ...prev,
      league,
      awayTeamId: "",
      homeTeamId: "",
      useCustomMatchup: false,
      customAwayName: "",
      customHomeName: "",
      betType: normalizeBetTypeForLeague(league, prev.betType),
    }));
    setAwayConferenceId("");
    setHomeConferenceId("");
    setTeamsLoading(true);
    loadTeamsForLeague(league)
      .then((loaded) => setTeams(loaded))
      .catch((err) => {
        setTeams([]);
        toast.error(err instanceof AdminApiError ? err.message : "Could not load teams");
      })
      .finally(() => setTeamsLoading(false));
  };

  const resolveTeam = (teamId: string) => {
    if (isCollegeFootballLeague(form.league)) {
      return findCollegeTeam(teamId) ?? teams.find((t) => t.id === teamId);
    }
    return teams.find((t) => t.id === teamId);
  };

  const buildPayload = (): CreatePickPayload => {
    const {
      customAwayName,
      customHomeName,
      useCustomMatchup,
      awayTeamId,
      homeTeamId,
      matchTimeLocal,
      hasConfidence,
      confidence,
      isPickOfDay,
      detailedAnalysis,
      odds,
      ...rest
    } = form;

    const matchTime = matchTimeLocal ? new Date(matchTimeLocal).toISOString() : undefined;
    const finalConfidence = hasConfidence ? confidence : undefined;

    const basePayload = {
      ...rest,
      matchTime,
      confidence: finalConfidence,
      isPickOfDay,
      ...(detailedAnalysis?.trim() && { detailedAnalysis: detailedAnalysis.trim() }),
      ...(odds?.trim() && { odds: odds.trim() }),
    };

    if (useCustomMatchup) {
      return {
        ...basePayload,
        useCustomMatchup: true,
        awayTeamName: customAwayName.trim(),
        homeTeamName: customHomeName.trim(),
      };
    }

    return {
      ...basePayload,
      awayTeamId,
      homeTeamId,
    };
  };

  const collegeMatchupReady =
    !isCollegeFootballLeague(form.league) ||
    (Boolean(awayConferenceId) && Boolean(homeConferenceId));

  const matchupReady = form.useCustomMatchup
    ? Boolean(form.customAwayName.trim() && form.customHomeName.trim())
    : Boolean(
        form.awayTeamId &&
          form.homeTeamId &&
          form.awayTeamId !== form.homeTeamId &&
          collegeMatchupReady
      );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchupReady) {
      toast.error(
        form.useCustomMatchup
          ? "Enter away and home for the custom matchup"
          : "Select away and home teams"
      );
      return;
    }
    const payload = buildPayload();
    setSubmitting(true);
    try {
      if (isEdit && pick) {
        await updateAdminPick(pick._id, payload);
        toast.success("Pick updated");
      } else {
        await createAdminPick(payload);
        toast.success("Pick published");
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      const message =
        err instanceof AdminApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to save pick";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const previewGame = form.useCustomMatchup
    ? form.customAwayName.trim() && form.customHomeName.trim()
      ? `${form.customAwayName.trim()} @ ${form.customHomeName.trim()}`
      : null
    : form.awayTeamId && form.homeTeamId
      ? (() => {
          const away = resolveTeam(form.awayTeamId ?? "");
          const home = resolveTeam(form.homeTeamId ?? "");
          if (away && home) return `${away.shortName} @ ${home.shortName}`;
          return null;
        })()
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={setDialogContainer}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-white/8 bg-[#0a0a0a] p-0 text-slate-100 sm:max-w-xl"
      >
        <DialogOverlayContainerContext.Provider value={dialogContainer}>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-white/8 px-5 py-4">
            <DialogTitle className="text-[15px] font-semibold text-white">
              {isEdit ? "Edit pick" : "Upload pick"}
            </DialogTitle>
            <DialogDescription className="mt-1 typo-caption text-subtle">
              League, matchup, title, analysis, odds, bet type, and confidence.
            </DialogDescription>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <Field label="League" id="pick-league">
              <LeagueSelect id="pick-league" value={form.league} onChange={handleLeagueChange} />
            </Field>

            <Field label="Matchup" id="pick-matchup">
              <MatchupSelect
                league={form.league}
                awayTeamId={form.awayTeamId ?? ""}
                homeTeamId={form.homeTeamId ?? ""}
                onAwayChange={(id) => update("awayTeamId", id)}
                onHomeChange={(id) => update("homeTeamId", id)}
                awayConferenceId={awayConferenceId}
                homeConferenceId={homeConferenceId}
                onAwayConferenceChange={setAwayConferenceId}
                onHomeConferenceChange={setHomeConferenceId}
                teams={teams}
                loading={teamsLoading}
                customMode={Boolean(form.useCustomMatchup)}
                onCustomModeChange={(enabled) => {
                  update("useCustomMatchup", enabled);
                  if (enabled) {
                    setAwayConferenceId("");
                    setHomeConferenceId("");
                  }
                }}
                customAwayName={form.customAwayName}
                customHomeName={form.customHomeName}
                onCustomAwayNameChange={(v) => update("customAwayName", v)}
                onCustomHomeNameChange={(v) => update("customHomeName", v)}
              />
              {teamsLoading ? (
                <p className="mt-1.5 typo-caption text-subtle">Loading teams…</p>
              ) : previewGame ? (
                <p className="mt-1.5 typo-caption text-subtle">Matchup: {previewGame}</p>
              ) : null}
            </Field>

            <Field label="Pick title" id="pick-title">
              <Input
                id="pick-title"
                required
                value={form.pickTitle}
                onChange={(e) => update("pickTitle", e.target.value)}
                placeholder="Short headline for the play"
                className={fieldClass}
              />
            </Field>

            <Field label="Detailed analysis (optional)" id="pick-analysis">
              <textarea
                id="pick-analysis"
                value={form.detailedAnalysis}
                onChange={(e) => update("detailedAnalysis", e.target.value)}
                placeholder="Reasoning, trends, injury notes, etc."
                className={textareaClass}
                rows={5}
              />
            </Field>

            <div className="space-y-4">
              <PickAccessMultiToggle
                value={form.access}
                onChange={(v) => update("access", v)}
                allowedAccess={allowedAccess}
              />
              <Field label="Status" id="pick-status">
                <PickStatusSelect
                  id="pick-status"
                  value={form.status}
                  onChange={(v) => update("status", v)}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Odds (optional)" id="pick-odds">
                <Input
                  id="pick-odds"
                  value={form.odds}
                  onChange={(e) => update("odds", e.target.value)}
                  placeholder="-110"
                  className={fieldClass}
                />
              </Field>

              <Field label="Bet type" id="pick-bet-type">
                <BetTypeSelect
                  id="pick-bet-type"
                  league={form.league}
                  value={form.betType}
                  onChange={(v) => update("betType", v)}
                />
              </Field>
            </div>

            <Field label="Match time (optional)" id="pick-match-time">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      fieldClass,
                      "h-9 border border-white/12 bg-white/5"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {form.matchTimeLocal
                      ? new Date(form.matchTimeLocal).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "Pick a date and time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-white/10 bg-zinc-950 p-0" align="start">
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={
                        form.matchTimeLocal ? new Date(form.matchTimeLocal) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const existingTime = form.matchTimeLocal
                            ? new Date(form.matchTimeLocal)
                            : new Date();
                          date.setHours(existingTime.getHours());
                          date.setMinutes(existingTime.getMinutes());
                          update("matchTimeLocal", date.toISOString().slice(0, 16));
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </div>
                  <div className="border-t border-white/10 px-3 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Time
                    </p>
                    {(() => {
                      const timePart = form.matchTimeLocal?.split("T")[1] ?? "12:00";
                      const [hhStr, mmStr] = timePart.split(":");
                      const hh24 = parseInt(hhStr, 10);
                      const mm = parseInt(mmStr, 10);
                      const hh12 = hh24 % 12 || 12;
                      const isPM = hh24 >= 12;
                      const datePart = form.matchTimeLocal?.split("T")[0] ?? "";

                      const setTime = (h24: number, m: number) => {
                        if (!datePart) return;
                        update("matchTimeLocal", `${datePart}T${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
                      };

                      return (
                        <div className="flex items-center gap-1.5">
                          {/* Hour */}
                          <select
                            value={hh12}
                            onChange={(e) => {
                              let h = parseInt(e.target.value, 10);
                              if (isPM) h = h === 12 ? 12 : h + 12;
                              else h = h === 12 ? 0 : h;
                              setTime(h, mm);
                            }}
                            disabled={!form.matchTimeLocal}
                            className="h-9 w-14 appearance-none rounded-lg border border-white/12 bg-white/5 px-2 text-center text-sm font-medium text-slate-100 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                              <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                            ))}
                          </select>
                          <span className="text-lg font-bold text-zinc-500">:</span>
                          {/* Minute */}
                          <select
                            value={mm}
                            onChange={(e) => setTime(hh24, parseInt(e.target.value, 10))}
                            disabled={!form.matchTimeLocal}
                            className="h-9 w-14 appearance-none rounded-lg border border-white/12 bg-white/5 px-2 text-center text-sm font-medium text-slate-100 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/25"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                            ))}
                          </select>
                          {/* AM/PM */}
                          <div className="ml-1 flex overflow-hidden rounded-lg border border-white/12">
                            {(["AM", "PM"] as const).map((period) => {
                              const isActive = period === "PM" ? isPM : !isPM;
                              return (
                                <button
                                  key={period}
                                  type="button"
                                  disabled={!form.matchTimeLocal}
                                  onClick={() => {
                                    const h12Val = hh24 % 12 || 12;
                                    let newH: number;
                                    if (period === "AM") newH = h12Val === 12 ? 0 : h12Val;
                                    else newH = h12Val === 12 ? 12 : h12Val + 12;
                                    setTime(newH, mm);
                                  }}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-semibold transition",
                                    isActive
                                      ? "bg-accent text-white"
                                      : "bg-white/5 text-zinc-500 hover:text-zinc-300"
                                  )}
                                >
                                  {period}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </PopoverContent>
              </Popover>
            </Field>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  id="pick-confidence-toggle"
                  type="checkbox"
                  checked={form.hasConfidence}
                  onChange={(e) => update("hasConfidence", e.target.checked)}
                  className="size-5 rounded border-white/20 bg-white/5 accent-accent cursor-pointer"
                />
                <label htmlFor="pick-confidence-toggle" className="text-sm font-medium text-slate-100 cursor-pointer">
                  Add confidence rating
                </label>
              </div>

              {form.hasConfidence && (
                <Field label={`Confidence (${form.confidence}%)`} id="pick-confidence">
                  <input
                    id="pick-confidence"
                    type="range"
                    min={1}
                    max={100}
                    value={form.confidence}
                    onChange={(e) => update("confidence", parseInt(e.target.value, 10))}
                    className="w-full accent-accent"
                  />
                  <div className="mt-1 flex justify-between typo-caption text-subtle">
                    <span>1%</span>
                    <span>100%</span>
                  </div>
                </Field>
              )}

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="pick-of-day-toggle"
                  type="checkbox"
                  checked={form.isPickOfDay}
                  onChange={(e) => update("isPickOfDay", e.target.checked)}
                  className="size-5 rounded border-white/20 bg-white/5 accent-accent cursor-pointer"
                />
                <label htmlFor="pick-of-day-toggle" className="text-sm font-medium text-slate-100 cursor-pointer">
                  Mark as Pick/Lock of the Day
                </label>
              </div>
            </div>
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
              disabled={submitting || teamsLoading || !matchupReady}
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
                "Publish pick"
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
