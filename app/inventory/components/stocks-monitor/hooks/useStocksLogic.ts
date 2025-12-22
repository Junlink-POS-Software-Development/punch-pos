// app/inventory/components/stocks-monitor/useStocksLogic.ts

import { useState, useMemo } from "react";
import { InventoryItem } from "../lib/inventory.api";

export function useStocksLogic(inventory: InventoryItem[] | undefined) {
  // --- State ---
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sortState, setSortState] = useState<{
    col: keyof InventoryItem | null;
    dir: "ASC" | "DESC" | null;
  }>({ col: null, dir: null });

  // --- Handlers ---
  const handleApplyFilter = (key: string, values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  const handleSort = (col: keyof InventoryItem, dir: "ASC" | "DESC" | null) => {
    setSortState({ col, dir });
  };

  // --- Data Processing ---
  const processedData = useMemo(() => {
    if (!inventory) return [];

    let data = [...inventory];

    // 1. Apply Filters
    Object.keys(filters).forEach((key) => {
      const selectedValues = filters[key];
      if (selectedValues && selectedValues.length > 0) {
        data = data.filter((item) => {
          const itemValue = String(item[key as keyof InventoryItem]);
          return selectedValues.includes(itemValue);
        });
      }
    });

    // 2. Apply Sort
    if (sortState.col && sortState.dir) {
      data.sort((a, b) => {
        const valA = a[sortState.col!];
        const valB = b[sortState.col!];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortState.dir === "ASC" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortState.dir === "ASC" ? -1 : 1;
        if (strA > strB) return sortState.dir === "ASC" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [inventory, filters, sortState]);

  return {
    processedData,
    filters,
    sortState,
    handleApplyFilter,
    handleSort,
  };
}