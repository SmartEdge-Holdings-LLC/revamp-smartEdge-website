import { LEAGUE_LOGOS, PICK_LEAGUES, type PickLeague } from "@/lib/sports-leagues";

export const LEAGUES = PICK_LEAGUES;

export type League = PickLeague;

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

export const SOCCER_BET_TYPES = ["home", "time", "away"] as const;

export const TENNIS_BET_TYPES = ["winner", "total_game_spread", "sets"] as const;

export const BET_TYPES = [
  ...DEFAULT_BET_TYPES,
  ...SOCCER_BET_TYPES,
  ...TENNIS_BET_TYPES,
] as const;

export type BetType = (typeof BET_TYPES)[number];

export function getBetTypesForLeague(league: League): readonly BetType[] {
  if (league === "SOCCER") return SOCCER_BET_TYPES;
  if (league === "TENNIS") return TENNIS_BET_TYPES;
  return DEFAULT_BET_TYPES;
}

export function getDefaultBetTypeForLeague(league: League): BetType {
  return getBetTypesForLeague(league)[0];
}

export function isBetTypeValidForLeague(league: League, betType: string): betType is BetType {
  return (getBetTypesForLeague(league) as readonly string[]).includes(betType);
}

/** Keeps `betType` when valid for `league`; otherwise uses that league’s default. */
export function normalizeBetTypeForLeague(league: League, betType: string): BetType {
  return isBetTypeValidForLeague(league, betType) ? betType : getDefaultBetTypeForLeague(league);
}

export const PICK_ACCESS = ["free", "smartedgeVIP", "smartedgeVIPPremium", "jonahvip", "jonah-vip-premium", "tournament"] as const;

export type PickAccess = (typeof PICK_ACCESS)[number];

export const PICK_STATUS = ["active", "inactive"] as const;

export type PickStatus = (typeof PICK_STATUS)[number];

export const PICK_RESULTS = ["pending", "won", "lost"] as const;

export type PickResult = (typeof PICK_RESULTS)[number];

export { LEAGUE_LOGOS };

export interface LeagueTeam {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

export interface LeagueTeamsResponse {
  league: League;
  teams: LeagueTeam[];
}

/**
 * Best-effort logo URL when `awayTeamLogo` / `homeTeamLogo` are missing (legacy rows).
 * Prefer logo paths returned from `GET /api/admin/league-teams` or stored on the pick.
 */
/** Client fallback when stored logo URL is missing (prefer API-hydrated `awayTeamLogo`). */
export function teamLogoPath(league: League, teamId: string): string {
  const slug = teamId.trim().toLowerCase();
  return `/leagues/${league.toLowerCase()}/${encodeURIComponent(slug)}.png`;
}

export type PickAuthorRole = "admin" | "subadmin" | "handicapper";

export interface PickAuthor {
  _id: string;
  name: string;
  email: string;
  role: PickAuthorRole;
}

export interface AdminPick {
  _id: string;
  league: League;
  awayTeamId?: string;
  homeTeamId?: string;
  awayTeamName?: string;
  homeTeamName?: string;
  awayTeamLogo?: string;
  homeTeamLogo?: string;
  game: string;
  pickTitle: string;
  detailedAnalysis?: string;
  odds?: string;
  betType: BetType;
  confidence?: number;
  access: PickAccess[];
  status: PickStatus;
  matchTime?: string;
  isPickOfDay?: boolean;
  result?: PickResult;
  createdBy: string | PickAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface ListPicksResponse {
  picks: AdminPick[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListPicksParams {
  page?: number;
  limit?: number;
  search?: string;
  betType?: BetType[];
  league?: League[];
  access?: PickAccess[];
}

export interface CreatePickPayload {
  league: League;
  useCustomMatchup?: boolean;
  awayTeamId?: string;
  homeTeamId?: string;
  awayTeamName?: string;
  homeTeamName?: string;
  game?: string;
  pickTitle: string;
  detailedAnalysis?: string;
  odds?: string;
  betType: BetType;
  confidence?: number;
  access: PickAccess[];
  status: PickStatus;
  matchTime?: string;
  isPickOfDay?: boolean;
}

export type UpdatePickPayload = Partial<CreatePickPayload> & {
  result?: PickResult;
};

export const PICK_ACCESS_LABELS: Record<PickAccess, string> = {
  free: "Free",
  smartedgeVIP: "SmartEdge VIP",
  smartedgeVIPPremium: "SmartEdge Premium",
  jonahvip: "Jonah's Monthly Standard",
  "jonah-vip-premium": "Jonah's Monthly VIP",
  tournament: "Tournament",
};

export const PICK_STATUS_LABELS: Record<PickStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const BET_TYPE_LABELS: Record<BetType, string> = {
  spread: "Spread",
  moneyline: "Moneyline",
  total: "Total (O/U)",
  parlay: "Parlay",
  player_prop: "Player prop",
  team_total: "Team total",
  other: "Other",
  home: "Home",
  time: "Time",
  away: "Away",
  winner: "Winner",
  total_game_spread: "Total game spread",
  sets: "Sets",
};
