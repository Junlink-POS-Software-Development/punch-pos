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

  const [sortState, setSortState] = useState<{
    col: keyof Item | null;
    dir: "ASC" | "DESC" | null;
  }>({ col: null, dir: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 or 20
  const paginationOptions = [10, 20, 50, 100];

  // 2. Filter & Sort Logic
  const processedRows = useMemo(() => {
    let rows = [...initialData];

    // A. Filter (Exact Match from List)
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

    // B. Sort
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
  }, [initialData, activeFilters, sortState]);

  // 3. Pagination Calculations
  const totalRows = processedRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  // Ensure safeCurrentPage is never out of bounds (e.g., after filtering)
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Calculate indices
  const startRow = (safeCurrentPage - 1) * rowsPerPage;
  const endRow = Math.min(startRow + rowsPerPage, totalRows);

  const paginatedRows = useMemo(() => {
    return processedRows.slice(startRow, endRow);
  }, [processedRows, startRow, endRow]);

  // 4. Handlers
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
    setCurrentPage(1); // Always reset to page 1 when filtering
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSortState({ col: null, dir: null });
    setCurrentPage(1);
  };

  const handleSort = (col: keyof Item, dir: "ASC" | "DESC" | null) => {
    setSortState({ col, dir });
  };

  // 5. Return Interface
  return {
    // Data
    paginatedRows,
    totalRows,

    // Filters
    activeFilters,
    handleApplyFilter,
    handleClearAllFilters,

    // Sorting
    sortState,
    handleSort,

    // Pagination
    safeCurrentPage,
    totalPages,
    startRow,
    endRow,
    rowsPerPage,
    paginationOptions,
    setRowsPerPage,
    setCurrentPage,
  };
};
