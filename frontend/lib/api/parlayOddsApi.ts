export type OddsSport = "MLB";

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Array<{
    key: string;
    last_update: string;
    outcomes: Array<{
      name: string;
      price: number;
      point?: number;
    }>;
  }>;
}

export interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: Bookmaker[];
  is_live: boolean;
  event_id?: string;
  game_date?: string;
  description?: string;
}

export interface OddsResponse {
  sport: string;
  sport_title: string;
  games: Game[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchSportOdds(sport: OddsSport): Promise<OddsResponse | null> {
  try {
    const endpoint = `${BACKEND_URL}/api/odds/baseball-mlb`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${sport} odds: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      sport: sport,
      sport_title: sport,
      games: data,
    };
  } catch (error) {
    console.error(`Error fetching ${sport} odds:`, error);
    return null;
  }
}

export async function fetchGameDetailsById(gameId: string): Promise<Game> {
  try {
    const endpoint = `${BACKEND_URL}/api/odds/game/${gameId}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch game details: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching game details for ${gameId}:`, error);
    throw error;
  }
}

export async function fetchEventOddsById(eventId: string): Promise<Game> {
  try {
    const endpoint = `${BACKEND_URL}/api/odds/event/${eventId}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event odds: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching event odds for ${eventId}:`, error);
    throw error;
  }
}
