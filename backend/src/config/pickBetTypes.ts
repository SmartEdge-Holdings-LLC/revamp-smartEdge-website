import type { League } from "./pickLeagues";

/** Standard US sports pick bet types. */
export const DEFAULT_BET_TYPES = [
  "spread",
  "moneyline",
  "total",
  "parlay",
  "player_prop",
  "team_total",
  "other",
] as const;

export type DefaultBetType = (typeof DEFAULT_BET_TYPES)[number];

export const SOCCOR_BET_TYPES = ["home", "time", "away"] as const;

export type SoccoorBetType = (typeof SOCCOR_BET_TYPES)[number]; // SOCCOR league 1X2-style picks

export const TENNIS_BET_TYPES = ["winner", "total_game_spread", "sets"] as const;

export type TennisBetType = (typeof TENNIS_BET_TYPES)[number];

export const BET_TYPES = [
  ...DEFAULT_BET_TYPES,
  ...SOCCOR_BET_TYPES,
  ...TENNIS_BET_TYPES,
] as const;

export type BetType = (typeof BET_TYPES)[number];

export function betTypesForLeague(league: League): readonly BetType[] {
  if (league === "SOCCOR") return SOCCOR_BET_TYPES;
  if (league === "TENNIS") return TENNIS_BET_TYPES;
  return DEFAULT_BET_TYPES;
}

export function defaultBetTypeForLeague(league: League): BetType {
  return betTypesForLeague(league)[0];
}

export function isBetTypeAllowedForLeague(league: League, betType: string): betType is BetType {
  return (betTypesForLeague(league) as readonly string[]).includes(betType);
}
