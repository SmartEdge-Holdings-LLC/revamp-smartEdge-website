import collegeData from "@/lib/data/college-football.json";
import type { League, LeagueTeam } from "@/types/picks";

export type CollegeConference = {
  id: string;
  name: string;
  teams: LeagueTeam[];
};

const conferences = collegeData.conferences as CollegeConference[];

const teamById = new Map<string, LeagueTeam & { conferenceId: string }>();

for (const conf of conferences) {
  for (const team of conf.teams) {
    teamById.set(team.id, { ...team, conferenceId: conf.id });
  }
}

export function isCollegeFootballLeague(league: League): boolean {
  return league === "COLLEGE" || league === "NCAAF";
}

/** NCAAF assets live under `public/leagues/ncaaf/` (conference subfolders). */
export function collegeFootballLeagueSlug(): string {
  return "ncaaf";
}

export function getCollegeConferences(): CollegeConference[] {
  return conferences;
}

export function getCollegeTeamsForConference(conferenceId: string): LeagueTeam[] {
  return conferences.find((c) => c.id === conferenceId)?.teams ?? [];
}

export function findCollegeTeam(teamId: string): (LeagueTeam & { conferenceId: string }) | undefined {
  if (!teamId) return undefined;
  return teamById.get(teamId);
}

export function findCollegeConferenceForTeam(teamId: string): string | undefined {
  return findCollegeTeam(teamId)?.conferenceId;
}

export function getAllCollegeTeams(): LeagueTeam[] {
  return conferences.flatMap((c) => c.teams);
}
