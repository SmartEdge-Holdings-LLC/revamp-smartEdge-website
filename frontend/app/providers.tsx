"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ReactNode, useMemo } from "react";
import { localStoragePersister } from "@/lib/utils/queryPersist";
import { useHashNavigation } from "@/lib/hooks/useHashNavigation";

function HashNavigationHandler({ children }: { children: ReactNode }) {
  useHashNavigation();
  return children;
}

export const Providers = ({ children }: { children: ReactNode }) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
          },
        },
      }),
    []
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // Keep persisted data for 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist these query keys to save storage
            const queryKey = query.queryKey[0];
            return ["liveOdds", "historicalOdds", "gameDetails"].includes(
              queryKey as string
            );
          },
        },
      }}
    >
      <SessionProvider
        refetchOnWindowFocus={false}
        refetchInterval={0}
        refetchWhenOffline={false}
      >
        <HashNavigationHandler>
          {children}
        </HashNavigationHandler>
        <Toaster position="top-right" />
      </SessionProvider>
    </PersistQueryClientProvider>
  );
};
