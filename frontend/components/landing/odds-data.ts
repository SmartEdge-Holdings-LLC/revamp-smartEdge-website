export type OddsSport = "MLB";

export const ODDS_SPORTS: OddsSport[] = ["MLB"];

export function oddsSportLogo(sport: OddsSport): string | undefined {
  const logos: Record<OddsSport, string | undefined> = {
    MLB: "/leagues/mlb/logo.png",
  };
  return logos[sport];
}
