/** Must match `PICK_LEAGUES` in `frontend/lib/sports-leagues.ts`. */
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
  "SOCCOR",
  "RACING",
] as const;

export type PickLeague = (typeof PICK_LEAGUES)[number];

export const LEAGUES = PICK_LEAGUES;

export type League = PickLeague;
