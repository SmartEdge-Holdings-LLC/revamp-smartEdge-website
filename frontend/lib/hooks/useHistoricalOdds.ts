import { useQuery } from "@tanstack/react-query";
import { fetchHistoricalMLBOdds, type HistoricalGame } from "@/lib/api/historicalOddsApi";

const STALE_TIME = 60 * 60 * 1000; // 1 hour - historical data doesn't change often
const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

export function useHistoricalOdds(date: string) {
  return useQuery({
    queryKey: ["historicalOdds", date],
    queryFn: async () => {
      const dateWithTime = date + "T12:00:00Z";
      return await fetchHistoricalMLBOdds(dateWithTime);
    },
    staleTime: STALE_TIME, // Data is considered fresh for 1 hour
    gcTime: CACHE_TIME, // Keep in cache for 24 hours
    refetchOnWindowFocus: false, // Don't refetch on window focus for historical data
    enabled: !!date, // Only fetch if date is provided
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type { HistoricalGame };
