//State management of the ItemTable.tsx component

"use client";

import { useState, useMemo } from "react";
import { Item } from "../../utils/itemTypes";

// --- Helper: Safely stringify values for filtering ---
const safeString = (val: unknown) =>
  val === null || val === undefined ? "(Blanks)" : String(val);

export const useProcessedItems = (initialData: Item[]) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortState, setSortState] = useState<{
    col: keyof Item | null;
    dir: "ASC" | "DESC" | null;
  }>({ col: null, dir: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const paginationOptions = [20, 50, 100, 200, 500];

  // --- Filter & Sort Logic ---
  const processedRows = useMemo(() => {
    let rows = [...initialData];

    // A. Filter
    Object.keys(activeFilters).forEach((key) => {
      const allowedValues = new Set(activeFilters[key]);
      if (allowedValues.size > 0) {
        rows = rows.filter((row) => {
          const val = safeString(row[key as keyof Item]);
          return allowedValues.has(val);
        });
      }
    });

    // B. Sort
    if (sortState.col && sortState.dir) {
      rows.sort((a, b) => {
        const colKey = sortState.col!;
        const valA = a[colKey];
        const valB = b[colKey];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortState.dir === "ASC" ? valA - valB : valB - valA;
        }

        const strA = valA !== null && valA !== undefined ? String(valA) : "";
        const strB = valB !== null && valB !== undefined ? String(valB) : "";

        return sortState.dir === "ASC"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }
    return rows;
  }, [initialData, activeFilters, sortState]);

  // --- Pagination Calculations ---
  const totalRows = processedRows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startRow = totalRows > 0 ? (safeCurrentPage - 1) * rowsPerPage + 1 : 0;
  const endRow = Math.min(safeCurrentPage * rowsPerPage, totalRows);

  const paginatedRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return processedRows.slice(startIndex, endIndex);
  }, [processedRows, safeCurrentPage, rowsPerPage]);

  // --- Handlers ---
  const handleApplyFilter = (
    key: string,
    values: string[] | null,
    sortDir?: "ASC" | "DESC"
  ) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (values === null) {
        delete next[key];
      } else {
        next[key] = values;
      }
      return next;
    });

    if (sortDir) {
      setSortState({ col: key as keyof Item, dir: sortDir });
    }
    setCurrentPage(1); // Reset page on filter
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSortState({ col: null, dir: null });
    setCurrentPage(1); // Reset page on clear
  };

  // --- Return all state and handlers ---
  return {
    // Data
    paginatedRows,
    totalRows,

    // Filters
    activeFilters,
    handleApplyFilter,
    handleClearAllFilters,

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
