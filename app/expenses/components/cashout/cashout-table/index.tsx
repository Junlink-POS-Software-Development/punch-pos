"use client";

import { useMemo } from "react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { CashoutTableProps } from "./types";
import { getColumns } from "./columns";
import { useInlineEditing } from "./hooks/useInlineEditing";
import { CashoutTableHeader } from "./CashoutTableHeader";
import { CashoutTableBody } from "./CashoutTableBody";

export const CashoutTable = ({
  expenses,
  isLoading,
  dateRange,
  onDateChange,
  onAdd,
  isAdding,
  onDelete,
  categories = [],
  onUpdate,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  totalRecords,
}: CashoutTableProps) => {
  // Inline editing logic (extracted into its own hook)
  const {
    editingId,
    editValues,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
    handleEditChange,
  } = useInlineEditing({ onUpdate });

  // Columns are memoized and defined externally
  const columns = useMemo(() => getColumns(), []);

  // Configure TanStack Table
  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      dateRange,
      onDateChange,
      editingId,
      editValues,
      isSaving,
      categories,
      handleEditChange,
      startEdit,
      cancelEdit,
      saveEdit,
      onDelete,
    },
  });

  const hasActiveFilter = Boolean(dateRange.start || dateRange.end);

  return (
    <div className="flex flex-col border border-slate-700/50 rounded-xl h-[80vh] overflow-hidden glass-effect bg-slate-900/40 backdrop-blur-md">
      <CashoutTableHeader
        onAdd={onAdd}
        isAdding={isAdding}
        recordCount={expenses.length}
        totalRecords={totalRecords}
        hasActiveFilter={hasActiveFilter}
      />
      <CashoutTableBody
        table={table}
        isLoading={isLoading}
        columnsCount={columns.length}
        editingId={editingId}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
};

// Re-export types for convenience
export type { CashoutTableProps, OptimisticExpenseData } from "./types";
