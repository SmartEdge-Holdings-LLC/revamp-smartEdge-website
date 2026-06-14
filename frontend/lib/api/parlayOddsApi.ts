const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export type OddsSport = "NFL" | "NBA" | "MLB" | "NHL";

export interface ParlayOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface ParlayMarket {
  key: string;
  outcomes: ParlayOutcome[];
}

export interface ParlayBookmaker {
  key: string;
  title: string;
  markets: ParlayMarket[];
}

export interface ParlayEvent {
  id: string;
  sport_key: string;
  sport_title?: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: ParlayBookmaker[];
}

export interface FetchOddsResponse {
  sportKey: string;
  sportTitle: string;
  count: number;
  events: ParlayEvent[];
  meta: {
    sandbox: boolean;
    creditsRemaining?: string;
    creditsUsed?: string;
  };
}

export async function fetchMlbOdds(): Promise<FetchOddsResponse | null> {
  try {
    if (!backendUrl) return null;

    const response = await fetch(`${backendUrl}/api/parlay/mlb`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch MLB odds: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching MLB odds:", error);
    return null;
  }
}

export async function fetchNflOdds(): Promise<FetchOddsResponse | null> {
  try {
    if (!backendUrl) return null;

    const response = await fetch(`${backendUrl}/api/parlay/nfl`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch NFL odds: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching NFL odds:", error);
    return null;
  }
}
