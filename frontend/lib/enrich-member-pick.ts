import type { PaidPick } from "@/lib/api/memberPicksApi";
import { teamLogoPath } from "@/types/picks";

function parseGameAt(game: string): { away?: string; home?: string } {
  const match = game.match(/^(.+?)\s*@\s*(.+)$/);
  if (!match) return {};
  return { away: match[1].trim(), home: match[2].trim() };
}

function logoForTeam(
  stored: string | undefined,
  league: PaidPick["league"],
  teamId: string | undefined
): string | undefined {
  if (stored?.trim()) return stored.trim();
  if (!teamId?.trim()) return undefined;
  return teamLogoPath(league, teamId);
}

export function enrichPaidPick(pick: PaidPick): PaidPick {
  const parsed = parseGameAt(pick.game);
  const awayTeamName = pick.awayTeamName?.trim() || parsed.away;
  const homeTeamName = pick.homeTeamName?.trim() || parsed.home;

  return {
    ...pick,
    awayTeamName,
    homeTeamName,
    awayTeamLogo: logoForTeam(pick.awayTeamLogo, pick.league, pick.awayTeamId),
    homeTeamLogo: logoForTeam(pick.homeTeamLogo, pick.league, pick.homeTeamId),
  };
}

export function enrichPaidPicks(picks: PaidPick[]): PaidPick[] {
  return picks.map(enrichPaidPick);
}
