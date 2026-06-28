/**
 * League mark assets under `public/sports/`.
 * Used by the landing sports slider and admin picks league dropdowns.
 */
export const SPORTS_LEAGUE_MARKS = [
  { name: "NBA", image: "/sports/nba.png" },
  { name: "NFL", image: "/sports/nfl.png" },
  { name: "MLB", image: "/sports/mlb.svg" },
  { name: "NHL", image: "/sports/nhl.svg" },
  { name: "WNBA", image: "/sports/wnba.png" },
  { name: "COLLEGE", image: "/sports/college.png" },
  { name: "NCAAF", image: "/sports/NCAAF.svg" },
  { name: "NCAAM", image: "/sports/NCAAM.svg" },
  { name: "NCAAW", image: "/sports/NCAAW.png" },
  { name: "MMA", image: "/sports/mma.png" },
  { name: "TENNIS", image: "/sports/tennis.svg" },
  { name: "SOCCER", image: "/sports/SOCCER.png" },
  { name: "RACING", image: "/sports/racing.png" },
  { name: "PGA TOUR", image: "/sports/pga-tour.png" },
] as const;

export type SportsLeagueMark = (typeof SPORTS_LEAGUE_MARKS)[number];

const markByName = new Map<string, string>(
  SPORTS_LEAGUE_MARKS.map((m) => [m.name, m.image])
);

/** Leagues available in admin picks (league filter + upload form). */
export const PICK_LEAGUES = [
  "NBA",
  "NFL",
  "MLB",
  "NHL",
  "WNBA",
  "COLLEGE",
  "NCAAF",
  "NCAAM",
  "NCAAW",
  "PGA TOUR",
  "MMA",
  "TENNIS",
  "SOCCER",
  "RACING",
] as const;

export type PickLeague = (typeof PICK_LEAGUES)[number];

const DEFAULT_LEAGUE_LOGO = "/leagues/nba-league.png";

const LEAGUE_LOGO_SOURCES: Partial<Record<PickLeague, string>> = {
  NBA: markByName.get("NBA") ?? DEFAULT_LEAGUE_LOGO,
  NFL: markByName.get("NFL") ?? DEFAULT_LEAGUE_LOGO,
  MLB: markByName.get("MLB") ?? "/sports/mlb.svg",
  NHL: markByName.get("NHL") ?? "/sports/nhl.svg",
  WNBA: markByName.get("WNBA") ?? "/sports/wnba.png",
  COLLEGE: markByName.get("COLLEGE") ?? "/sports/college.png",
  NCAAF: markByName.get("NCAAF") ?? "/sports/NCAAF.svg",
  NCAAM: markByName.get("NCAAM") ?? "/sports/NCAAM.svg",
  NCAAW: markByName.get("NCAAW") ?? "/sports/NCAAW.png",
  MMA: markByName.get("MMA") ?? "/sports/mma.png",
  TENNIS: markByName.get("TENNIS") ?? "/sports/tennis.svg",
  SOCCER: markByName.get("SOCCER") ?? "/sports/SOCCER.png",
  RACING: markByName.get("RACING") ?? "/sports/racing.png",
  "PGA TOUR": markByName.get("PGA TOUR") ?? "/sports/pga-tour.png",
};

export const LEAGUE_LOGOS: Record<PickLeague, string> = Object.fromEntries(
  PICK_LEAGUES.map((league) => [league, LEAGUE_LOGO_SOURCES[league] ?? DEFAULT_LEAGUE_LOGO])
) as Record<PickLeague, string>;

export function getSportsLeagueLogo(name: string): string | undefined {
  return markByName.get(name);
}

/** Safe logo URL for admin pick league UI (never undefined). */
export function getPickLeagueLogo(league: string | undefined): string {
  if (league && league in LEAGUE_LOGOS) {
    return LEAGUE_LOGOS[league as PickLeague];
  }
  return DEFAULT_LEAGUE_LOGO;
}
