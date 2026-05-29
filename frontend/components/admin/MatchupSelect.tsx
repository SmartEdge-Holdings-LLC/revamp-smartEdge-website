"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { ConferenceSelect } from "@/components/admin/ConferenceSelect";
import { TeamSelect } from "@/components/admin/TeamSelect";
import { Input } from "@/components/ui/input";
import {
  getCollegeConferences,
  getCollegeTeamsForConference,
  isCollegeFootballLeague,
} from "@/lib/college-football";
import { cn } from "@/lib/utils";
import type { League, LeagueTeam } from "@/types/picks";

const fieldClass =
  "h-9 border-white/12 bg-white/5 typo-body-sm text-slate-100 placeholder:text-subtle focus-visible:border-accent/55 focus-visible:ring-accent/25";

type MatchupSelectProps = {
  league: League;
  awayTeamId: string;
  homeTeamId: string;
  onAwayChange: (id: string) => void;
  onHomeChange: (id: string) => void;
  awayConferenceId: string;
  homeConferenceId: string;
  onAwayConferenceChange: (id: string) => void;
  onHomeConferenceChange: (id: string) => void;
  teams: LeagueTeam[];
  loading?: boolean;
  customMode: boolean;
  onCustomModeChange: (enabled: boolean) => void;
  customAwayName: string;
  customHomeName: string;
  onCustomAwayNameChange: (value: string) => void;
  onCustomHomeNameChange: (value: string) => void;
};

export function MatchupSelect({
  league,
  awayTeamId,
  homeTeamId,
  onAwayChange,
  onHomeChange,
  awayConferenceId,
  homeConferenceId,
  onAwayConferenceChange,
  onHomeConferenceChange,
  teams,
  loading,
  customMode,
  onCustomModeChange,
  customAwayName,
  customHomeName,
  onCustomAwayNameChange,
  onCustomHomeNameChange,
}: MatchupSelectProps) {
  const collegeMode = isCollegeFootballLeague(league);
  const conferences = collegeMode ? getCollegeConferences() : [];
  const awayTeams = collegeMode
    ? getCollegeTeamsForConference(awayConferenceId)
    : teams;
  const homeTeams = collegeMode
    ? getCollegeTeamsForConference(homeConferenceId)
    : teams;

  const toggleCustom = () => {
    if (customMode) {
      onCustomModeChange(false);
      onCustomAwayNameChange("");
      onCustomHomeNameChange("");
    } else {
      onCustomModeChange(true);
      onAwayChange("");
      onHomeChange("");
      onAwayConferenceChange("");
      onHomeConferenceChange("");
    }
  };

  const handleAwayConferenceChange = (id: string) => {
    onAwayConferenceChange(id);
    onAwayChange("");
  };

  const handleHomeConferenceChange = (id: string) => {
    onHomeConferenceChange(id);
    onHomeChange("");
  };

  if (customMode) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="typo-caption text-subtle">Enter matchup manually (optional)</p>
          <button
            type="button"
            onClick={toggleCustom}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-white/12 bg-white/5 text-subtle transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            aria-label="Use team list instead"
            title="Use team list"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <div className="space-y-1.5">
            <span className="typo-caption font-medium text-zinc-300">Away</span>
            <Input
              id="pick-custom-away"
              value={customAwayName}
              onChange={(e) => onCustomAwayNameChange(e.target.value)}
              placeholder="Away side"
              className={fieldClass}
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-center pb-2 sm:pb-2.5">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-subtle">
              at
            </span>
          </div>
          <div className="space-y-1.5">
            <span className="typo-caption font-medium text-zinc-300">Home</span>
            <Input
              id="pick-custom-home"
              value={customHomeName}
              onChange={(e) => onCustomHomeNameChange(e.target.value)}
              placeholder="Home side"
              className={fieldClass}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleCustom}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md border border-white/12 bg-white/5 text-subtle transition-colors",
            "hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
          )}
          aria-label="Enter custom matchup"
          title="Enter custom matchup"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
        <div className="space-y-3">
          <span className="typo-caption font-medium text-zinc-300">Away</span>
          {collegeMode ? (
            <div className="space-y-2">
              <ConferenceSelect
                id="pick-away-conference"
                value={awayConferenceId}
                onChange={handleAwayConferenceChange}
                conferences={conferences}
                placeholder="Away conference"
                disabled={loading}
              />
              <TeamSelect
                id="pick-away-team"
                value={awayTeamId}
                onChange={onAwayChange}
                teams={awayTeams}
                placeholder="Away team"
                disabled={loading || !awayConferenceId}
                excludeTeamId={homeTeamId}
              />
            </div>
          ) : (
            <TeamSelect
              id="pick-away-team"
              value={awayTeamId}
              onChange={onAwayChange}
              teams={awayTeams}
              placeholder="Away team"
              disabled={loading}
              excludeTeamId={homeTeamId}
            />
          )}
        </div>
        <div className="flex items-center justify-center pt-8 sm:pt-9">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-subtle">
            at
          </span>
        </div>
        <div className="space-y-3">
          <span className="typo-caption font-medium text-zinc-300">Home</span>
          {collegeMode ? (
            <div className="space-y-2">
              <ConferenceSelect
                id="pick-home-conference"
                value={homeConferenceId}
                onChange={handleHomeConferenceChange}
                conferences={conferences}
                placeholder="Home conference"
                disabled={loading}
              />
              <TeamSelect
                id="pick-home-team"
                value={homeTeamId}
                onChange={onHomeChange}
                teams={homeTeams}
                placeholder="Home team"
                disabled={loading || !homeConferenceId}
                excludeTeamId={awayTeamId}
              />
            </div>
          ) : (
            <TeamSelect
              id="pick-home-team"
              value={homeTeamId}
              onChange={onHomeChange}
              teams={homeTeams}
              placeholder="Home team"
              disabled={loading}
              excludeTeamId={awayTeamId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
