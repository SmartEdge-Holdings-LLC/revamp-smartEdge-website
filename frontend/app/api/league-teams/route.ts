import { NextRequest, NextResponse } from "next/server";
import { scanLeagueTeamsFromPublic } from "@/lib/scan-league-teams";
import { PICK_LEAGUES } from "@/lib/sports-leagues";
import type { League } from "@/types/picks";

export async function GET(request: NextRequest) {
  const leagueParam = request.nextUrl.searchParams.get("league")?.trim().toUpperCase() ?? "NBA";

  if (!PICK_LEAGUES.includes(leagueParam as League)) {
    return NextResponse.json(
      { error: `Invalid league. Use one of: ${PICK_LEAGUES.join(", ")}` },
      { status: 400 }
    );
  }

  const league = leagueParam as League;
  const teams = scanLeagueTeamsFromPublic(league);

  return NextResponse.json({ league, teams });
}
