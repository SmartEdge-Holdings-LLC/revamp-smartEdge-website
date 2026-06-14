export type OddsSport = "NFL" | "NBA" | "MLB" | "NHL";

const SPORT_MAP: Record<OddsSport, string> = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  MLB: "baseball_mlb",
  NHL: "ice_hockey_nhl",
};

export interface Bookmaker {
  key: string;
  title: string;
  home_odds: number | null;
  away_odds: number | null;
  blurred: boolean;
}

export interface Game {
  home_team: string;
  away_team: string;
  commence_time: string;
  game_date: string;
  is_live: boolean;
  bookmakers: Bookmaker[];
  event_id: string;
  description: string;
}

export interface OddsResponse {
  sport: string;
  sport_title: string;
  games: Game[];
}

export async function fetchSportOdds(sport: OddsSport): Promise<OddsResponse | null> {
  try {
    const sportKey = SPORT_MAP[sport];
    const response = await fetch(
      `https://parlay-api.com/live/api/games?sport=${sportKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch ${sport} odds: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${sport} odds:`, error);
    return null;
  }
}
