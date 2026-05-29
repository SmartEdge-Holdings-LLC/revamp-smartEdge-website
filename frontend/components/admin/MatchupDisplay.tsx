"use client";

import { TeamLogo } from "@/components/admin/TeamLogo";
import { cn } from "@/lib/utils";
import type { AdminPick, LeagueTeam } from "@/types/picks";
import { teamLogoPath } from "@/types/picks";

type MatchupDisplayProps = {
  pick: Pick<
    AdminPick,
    | "game"
    | "league"
    | "awayTeamId"
    | "homeTeamId"
    | "awayTeamName"
    | "homeTeamName"
    | "awayTeamLogo"
    | "homeTeamLogo"
  >;
  className?: string;
  logoSize?: number;
};

function logoForPick(
  stored: string | undefined,
  league: AdminPick["league"],
  teamId: string | undefined
): string | null {
  if (stored?.trim()) return stored;
  if (!teamId?.trim()) return null;
  return teamLogoPath(league, teamId);
}

export function MatchupDisplay({ pick, className, logoSize = 18 }: MatchupDisplayProps) {
  const awayLogo = logoForPick(pick.awayTeamLogo, pick.league, pick.awayTeamId);
  const homeLogo = logoForPick(pick.homeTeamLogo, pick.league, pick.homeTeamId);
  const awayLabel = pick.awayTeamName?.trim();
  const homeLabel = pick.homeTeamName?.trim();

  const canShowRich =
    Boolean(awayLabel || homeLabel) && Boolean(awayLogo || homeLogo || awayLabel || homeLabel);

  if (canShowRich && (awayLabel || awayLogo) && (homeLabel || homeLogo)) {
    return (
      <div className={cn("flex min-w-0 flex-wrap items-center gap-1.5", className)}>
        <span className="inline-flex min-w-0 items-center gap-1 font-medium text-white">
          {awayLogo ? (
            <TeamLogo src={awayLogo} shortName={awayLabel ?? "Away"} size={logoSize} />
          ) : null}
          <span className="truncate">{awayLabel ?? "Away"}</span>
        </span>
        <span className="text-[11px] font-medium uppercase text-subtle">at</span>
        <span className="inline-flex min-w-0 items-center gap-1 font-medium text-white">
          {homeLogo ? (
            <TeamLogo src={homeLogo} shortName={homeLabel ?? "Home"} size={logoSize} />
          ) : null}
          <span className="truncate">{homeLabel ?? "Home"}</span>
        </span>
      </div>
    );
  }

  return <span className={cn("truncate font-medium text-white", className)}>{pick.game}</span>;
}

export function MatchupDisplayFromTeams({
  away,
  home,
  className,
  logoSize = 18,
}: {
  away: LeagueTeam;
  home: LeagueTeam;
  className?: string;
  logoSize?: number;
}) {
  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-1.5", className)}>
      <span className="inline-flex items-center gap-1 font-medium text-white">
        <TeamLogo src={away.logo} shortName={away.shortName} size={logoSize} />
        {away.shortName}
      </span>
      <span className="text-[11px] font-medium uppercase text-subtle">at</span>
      <span className="inline-flex items-center gap-1 font-medium text-white">
        <TeamLogo src={home.logo} shortName={home.shortName} size={logoSize} />
        {home.shortName}
      </span>
    </div>
  );
}
