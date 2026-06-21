import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalMLBOdds, type HistoricalGame } from "@/lib/api/historicalOddsApi";

const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours - historical data never changes
const CACHE_TIME = 7 * 24 * 60 * 60 * 1000; // 7 days - keep old data cached

export function useHistoricalOdds(date: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ["historicalOdds", date],
    queryFn: async () => {
      const dateWithTime = date + "T12:00:00Z";
      return await fetchHistoricalMLBOdds(dateWithTime);
    },
    staleTime: STALE_TIME, // Historical data never changes - keep fresh for full day
    gcTime: CACHE_TIME, // Keep in cache for 7 days
    refetchOnWindowFocus: false, // Never refetch on window focus
    refetchOnReconnect: false, // Never refetch on reconnect for historical data
    enabled: enabled && !!date, // Only fetch if enabled and date is provided
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export type { HistoricalGame };
