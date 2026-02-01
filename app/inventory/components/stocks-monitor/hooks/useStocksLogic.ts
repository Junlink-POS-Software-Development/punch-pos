// app/inventory/components/stocks-monitor/useStocksLogic.ts

import { useState } from "react";
import { InventoryItem } from "../lib/inventory.api";

export function useStocksLogic() {
  // --- State ---
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sortState, setSortState] = useState<{
    col: keyof InventoryItem;
    dir: "ASC" | "DESC";
  }>({ col: "item_name", dir: "ASC" }); // Default Alphabetical

  const [searchTerm, setSearchTerm] = useState("");

  // --- Handlers ---
  const handleApplyFilter = (key: string, values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  const handleSort = (col: keyof InventoryItem, dir: "ASC" | "DESC" | null) => {
    // If null, reset to default alphabetical
    if (!col || !dir) {
       setSortState({ col: "item_name", dir: "ASC" }); 
       return;
    }
    setSortState({ col, dir });
  };

  return {
    filters,
    sortState,
    searchTerm,
    setSearchTerm,
    handleApplyFilter,
    handleSort,
  };
}