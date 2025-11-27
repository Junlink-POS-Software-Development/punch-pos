// app/inventory/components/stocks-monitor/context/InventoryContext.tsx
"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInventory, InventoryItem } from "../lib/inventory.api";

interface InventoryContextType {
  inventory: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["inventory-monitor"], // Unified key for all consumers
    queryFn: () => fetchInventory(),
    // Reduced from 5s to 30s to prevent timeout issues when tab is idle
    // Only refetch when tab is focused to save resources
    refetchInterval: (query) => {
      // Only auto-refetch when window is focused
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        return 30000; // 30 seconds
      }
      return false; // Don't refetch when tab is not visible
    },
    // Only refetch on window focus if data is stale (>30s old)
    refetchOnWindowFocus: 'always',
    staleTime: 30000,
  });

  return (
    <InventoryContext.Provider
      value={{
        inventory: data || [],
        isLoading,
        error: error as Error | null,
        refetch,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return context;
};
