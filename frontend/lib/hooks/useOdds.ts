import { useQuery } from "@tanstack/react-query";
import { fetchSportOdds, type Game } from "@/lib/api/parlayOddsApi";
import { type OddsSport } from "@/components/landing/odds-data";

const STALE_TIME = 10 * 60 * 1000; // 10 minutes - keep data fresh without hammering API
const CACHE_TIME = 60 * 60 * 1000; // 1 hour - long cache to minimize API calls

export function useLiveOdds(sport: OddsSport) {
  return useQuery({
    queryKey: ["liveOdds", sport],
    queryFn: async () => {
      const data = await fetchSportOdds(sport);
      return data?.games || [];
    },
    staleTime: STALE_TIME, // Only refetch after 10 minutes
    gcTime: CACHE_TIME, // Keep in cache for 1 hour
    refetchOnWindowFocus: false, // Don't refetch on every tab switch
    refetchOnReconnect: true, // Only refetch when reconnecting after offline
    refetchInterval: false, // No automatic refetch - save API quota
    retry: 1, // Reduce retry attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export type { Game };
