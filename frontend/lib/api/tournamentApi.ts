const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface TournamentPrize {
  type: "discount" | "freeMonth" | "custom";
  value: number;
  description?: string;
}

export interface TournamentGame {
  id: string;
  game: string;
  pickTitle: string;
  league: string;
  awayTeamName?: string;
  homeTeamName?: string;
  odds: string;
  betType: string;
  matchTime?: string;
}

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "completed";
  gameIds: string[];
  prize: TournamentPrize;
  entries: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  games?: TournamentGame[];
}

export interface LeaderboardEntry {
  id: string;
  memberId: string;
  memberName: string;
  picks: string[];
  score: number;
  rank: number;
  prizeStatus: "unclaimed" | "claimed";
  updatedAt: string;
}

export interface MyTournamentEntry {
  id: string;
  tournamentId: string;
  picks: string[];
  score: number;
  rank: number;
  prizeStatus: "unclaimed" | "claimed";
  createdAt: string;
  updatedAt: string;
  tournament?: Tournament | null;
}

async function tournamentFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${backendUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (HTTP ${res.status})`);
  }
  return data;
}

export async function listActiveTournaments(
  token: string
): Promise<{ tournaments: Tournament[] }> {
  return tournamentFetch("/api/tournaments", token);
}

export async function getTournament(
  token: string,
  id: string
): Promise<{ tournament: Tournament }> {
  return tournamentFetch(`/api/tournaments/${encodeURIComponent(id)}`, token);
}

export async function getTournamentLeaderboard(
  token: string,
  id: string
): Promise<{ entries: LeaderboardEntry[] }> {
  return tournamentFetch(
    `/api/tournaments/${encodeURIComponent(id)}/leaderboard`,
    token
  );
}

export async function getMyTournamentEntries(
  token: string
): Promise<{ entries: MyTournamentEntry[] }> {
  return tournamentFetch("/api/user/tournaments", token);
}

export async function getMyTournamentEntry(
  token: string,
  tournamentId: string
): Promise<{ entry: MyTournamentEntry | null }> {
  return tournamentFetch(
    `/api/user/tournaments/${encodeURIComponent(tournamentId)}/my-entry`,
    token
  );
}

export async function joinTournament(
  token: string,
  tournamentId: string
): Promise<{ entry: { id: string; tournamentId: string; status: string } }> {
  return tournamentFetch(
    `/api/user/tournaments/${encodeURIComponent(tournamentId)}/join`,
    token,
    { method: "POST" }
  );
}

export async function submitTournamentPicks(
  token: string,
  tournamentId: string,
  picks: string[]
): Promise<{ entry: { id: string; picks: string[]; score: number; rank: number } }> {
  return tournamentFetch(
    `/api/user/tournaments/${encodeURIComponent(tournamentId)}/my-picks`,
    token,
    { method: "PUT", body: JSON.stringify({ picks }) }
  );
}
