"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";

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
    <QueryClientProvider client={queryClient}>
      <SessionProvider
        refetchOnWindowFocus={false}
        refetchInterval={0}
        refetchWhenOffline={false}
      >
        {children}
        <Toaster position="top-right" />
      </SessionProvider>
    </QueryClientProvider>
  );
};
