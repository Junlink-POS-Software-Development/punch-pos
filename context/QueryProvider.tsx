// QueryProvider.tsx (or directly in layout.tsx)
"use client"; // Must be a client component to use state/hooks

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // Optional but recommended
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
            
            // Retry configuration with exponential backoff
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Disable automatic refetch on window focus to prevent unnecessary requests
            // Data will still refetch if it's beyond staleTime when a query is used
            refetchOnWindowFocus: false,
            
            // Disable refetch on reconnect to prevent request floods
            // Users can manually refresh if needed
            refetchOnReconnect: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} /> {/* Optional dev tools */}
    </QueryClientProvider>
  );
}
