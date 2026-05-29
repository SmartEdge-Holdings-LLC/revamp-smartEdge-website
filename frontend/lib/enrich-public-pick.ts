import type { PublicPick } from "@/lib/api/picksApi";
import { teamLogoPath } from "@/types/picks";

/** Parse "Away @ Home" when team name fields are missing. */
function parseGameAt(game: string): { away?: string; home?: string } {
  const match = game.match(/^(.+?)\s*@\s*(.+)$/);
  if (!match) return {};
  return { away: match[1].trim(), home: match[2].trim() };
}

function logoForTeam(
  stored: string | undefined,
  league: PublicPick["league"],
  teamId: string | undefined
): string | undefined {
  if (stored?.trim()) return stored.trim();
  if (!teamId?.trim()) return undefined;
  return teamLogoPath(league, teamId);
}

/** Fill missing team labels/logos so public cards can render matchup logos. */
export function enrichPublicPick(pick: PublicPick): PublicPick {
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

export function enrichPublicPicks(picks: PublicPick[]): PublicPick[] {
  return picks.map(enrichPublicPick);
}
