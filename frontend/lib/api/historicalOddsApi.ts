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

export interface HistoricalGame {
  id: string;
  away_team: string;
  home_team: string;
  commence_time: string;
  bookmakers: Bookmaker[];
}

export interface HistoricalOddsResponse {
  data: HistoricalGame[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchHistoricalMLBOdds(date?: string): Promise<HistoricalGame[]> {
  try {
    const dateParam = date || new Date().toISOString().split("T")[0] + "T12:00:00Z";

    const endpoint = `${BACKEND_URL}/api/odds/baseball-mlb/historical?date=${encodeURIComponent(dateParam)}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch historical odds: ${response.status}`);
      return [];
    }

    const responseData = await response.json();
    return responseData.data || [];
  } catch (error) {
    console.error("Error fetching historical odds:", error);
    return [];
  }
}
