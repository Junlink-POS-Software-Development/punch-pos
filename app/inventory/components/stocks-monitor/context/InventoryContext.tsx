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
    refetchInterval: 5000, // Auto-refresh every 5 seconds
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
