"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import * as idb from "idb-keyval";
import { useState, useEffect } from "react";

export function QueryProvider({
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
            // Retry a bit more aggressively when offline might transiently toggle
            retry: 3, 
          },
        },
      })
  );

  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window !== "undefined") {
      const asyncStoragePersister = createAsyncStoragePersister({
        storage: {
          getItem: async (key: string) => await idb.get(key),
          setItem: async (key: string, value: unknown) => {
            try {
              await idb.set(key, value);
            } catch (err) {
              console.error("idb-keyval set error:", err);
            }
          },
          removeItem: async (key: string) => await idb.del(key),
        },
        key: 'react-query-offline-cache',
      });
      setPersister(asyncStoragePersister);
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
