// app/inventory/components/item-registration/hooks/useProcessedItems.ts

"use client";

import { useState, useMemo } from "react";
import { Item } from "../../utils/itemTypes"; // Adjust path if needed based on your folder structure

// --- Helper: Safely stringify values for filtering ---
const safeString = (val: unknown) =>
  val === null || val === undefined ? "" : String(val).toLowerCase();

export const useProcessedItems = (initialData: Item[]) => {
  // 1. State
  // Changed to Record<string, string[]> to support multi-select filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [sortState, setSortState] = useState<{
    col: keyof Item | null;
    dir: "ASC" | "DESC" | null;
  }>({ col: null, dir: null });

  // 2. Filter & Sort Logic
  const processedRows = useMemo(() => {
    let rows = [...initialData];

    // A. Search (Case-insensitive)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      rows = rows.filter((row) => {
        return (
          safeString(row.itemName).includes(lowerSearch) ||
          safeString(row.sku).includes(lowerSearch) ||
          safeString(row.description).includes(lowerSearch) ||
          safeString(row.categoryName).includes(lowerSearch)
        );
      });
    }

    // B. Filter (Exact Match from List)
    if (Object.keys(activeFilters).length > 0) {
      rows = rows.filter((row) => {
        return Object.entries(activeFilters).every(([key, filterValues]) => {
          // If no values selected for this filter, ignore it (or treat as "show all")
          if (!filterValues || filterValues.length === 0) return true;

          const rowValue = safeString(row[key as keyof Item]);
          
          // Check if the row's value is in the selected filter values
          // We compare lowercased strings for consistency
          return filterValues.some(val => val.toLowerCase() === rowValue);
        });
      });
    }

    // C. Sort
    if (sortState.col && sortState.dir) {
      rows.sort((a, b) => {
        const colKey = sortState.col!;
        const valA = a[colKey];
        const valB = b[colKey];

        // Number sorting
        if (typeof valA === "number" && typeof valB === "number") {
          return sortState.dir === "ASC" ? valA - valB : valB - valA;
        }

        // String sorting
        const strA = safeString(valA);
        const strB = safeString(valB);

        return sortState.dir === "ASC"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return rows;
  }, [initialData, activeFilters, sortState, searchTerm]);

  // 3. Handlers
  const handleApplyFilter = (key: string, values: string[]) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (!values || values.length === 0) {
        delete next[key];
      } else {
        next[key] = values;
      }
      return next;
    });
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSortState({ col: null, dir: null });
    setSearchTerm("");
  };

  const handleSort = (col: keyof Item, dir: "ASC" | "DESC" | null) => {
    setSortState({ col, dir });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // 4. Return Interface
  return {
    // Data
    rows: processedRows,
    totalRows: processedRows.length,

    // Search
    searchTerm,
    handleSearch,

    // Filters
    activeFilters,
    handleApplyFilter,
    handleClearAllFilters,

    // Sorting
    sortState,
    handleSort,
  };
};
