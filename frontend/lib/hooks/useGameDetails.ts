import { useQuery } from "@tanstack/react-query";
import { fetchGameDetailsById, type Game } from "@/lib/api/parlayOddsApi";

const STALE_TIME = 10 * 60 * 1000; // 10 minutes - reuse cached game data
const CACHE_TIME = 60 * 60 * 1000; // 1 hour - long cache to minimize API calls

export function useGameDetails(gameId: string | null) {
  return useQuery({
    queryKey: ["gameDetails", gameId],
    queryFn: async () => {
      if (!gameId) throw new Error("Game ID is required");
      return await fetchGameDetailsById(gameId);
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: !!gameId,
    retry: 1, // Reduce retry attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export type { Game };
