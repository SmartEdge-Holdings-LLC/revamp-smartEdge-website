import { useQuery } from "@tanstack/react-query";
import { fetchSportOdds, type Game } from "@/lib/api/parlayOddsApi";
import { type OddsSport } from "@/components/landing/odds-data";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export function useLiveOdds(sport: OddsSport) {
  return useQuery({
    queryKey: ["liveOdds", sport],
    queryFn: async () => {
      const data = await fetchSportOdds(sport);
      return data?.games || [];
    },
    staleTime: STALE_TIME, // Data is considered fresh for 5 minutes
    gcTime: CACHE_TIME, // Keep in cache for 30 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when reconnecting
    refetchInterval: 30 * 1000, // Auto refetch every 30 seconds for real-time updates
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type { Game };
