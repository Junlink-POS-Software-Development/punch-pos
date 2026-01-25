"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, useEffect } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 24 hours cache time (gcTime)
            gcTime: 1000 * 60 * 60 * 24, 
            // 5 minutes stale time (consider data fresh for 5 mins)
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
          },
        },
      })
  );

  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window !== "undefined") {
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
      });
      setPersister(localStoragePersister);
    }
  }, []);

  if (!persister) {
    // Render nothing or a simple loader until persister is ready
    // This prevents hydration mismatch
    return null; 
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
