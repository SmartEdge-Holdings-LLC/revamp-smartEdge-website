import { useQuery } from "@tanstack/react-query";
import { fetchEventOddsById, type Game } from "@/lib/api/parlayOddsApi";

const STALE_TIME = 10 * 60 * 1000; // 10 minutes - reuse cached event data
const CACHE_TIME = 60 * 60 * 1000; // 1 hour - long cache to minimize API calls

export function useEventOdds(eventId: string | null) {
  return useQuery({
    queryKey: ["eventOdds", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      return await fetchEventOddsById(eventId);
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: !!eventId,
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export type { Game };
