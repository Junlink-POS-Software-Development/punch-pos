// app/inventory/components/item-registration/ItemTable.tsx

"use client";

import React, { useMemo, useState, useCallback } from "react";
import { DataGrid, Column, RenderEditCellProps } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { XCircle } from "lucide-react";
import { Item } from "../utils/itemTypes";

// Imports from our new modular files
import { useProcessedItems } from "./hooks/useProcessedItems";
import { HeaderWithFilter } from "./HeaderWithFilter";
import { ItemTablePagination } from "../../../../../components/reusables/ItemTablePagination";
import { ItemActions } from "./ItemActions";

interface ItemTableProps {
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onSaveEdit?: (item: Item) => void;
}

// Text editor for editable cells
function TextEditor<T>({ row, column, onRowChange, onClose }: RenderEditCellProps<T>) {
  const value = row[column.key as keyof T];
  return (
    <input
      className="w-full h-full bg-gray-800 text-white border border-blue-500 rounded px-2 outline-none"
      autoFocus
      value={value as string ?? ""}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}

// Number editor for costPrice and lowStockThreshold
function NumberEditor<T>({ row, column, onRowChange, onClose }: RenderEditCellProps<T>) {
  const value = row[column.key as keyof T];
  return (
    <input
      type="number"
      className="w-full h-full bg-gray-800 text-white border border-blue-500 rounded px-2 outline-none"
      autoFocus
      value={value as number ?? ""}
      onChange={(e) => {
        const val = e.target.value === "" ? null : parseFloat(e.target.value);
        onRowChange({ ...row, [column.key]: val });
      }}
      onBlur={() => onClose(true)}
    />
  );
}

export const ItemTable: React.FC<ItemTableProps> = ({
  data,
  onEdit,
  onDelete,
  onSaveEdit,
}) => {
  // State for tracking which row is being edited
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  // State for the edited row data
  const [editedRow, setEditedRow] = useState<Item | null>(null);

  // 1. Use the Hook
  const {
    paginatedRows,
    totalRows,
    activeFilters,
    sortState,
    handleSort,
    handleApplyFilter,
    handleClearAllFilters,
    safeCurrentPage,
    totalPages,
    startRow,
    endRow,
    rowsPerPage,
    paginationOptions,
    setRowsPerPage,
    setCurrentPage,
  } = useProcessedItems(data);

  // Handle entering edit mode
  const handleStartEdit = useCallback((row: Item) => {
    setEditingRowId(row.id!);
    setEditedRow({ ...row });
  }, []);

  // Handle saving edits
  const handleSaveEdit = useCallback(() => {
    if (editedRow && onSaveEdit) {
      onSaveEdit(editedRow);
    }
    setEditingRowId(null);
    setEditedRow(null);
  }, [editedRow, onSaveEdit]);

  // Handle canceling edits
  const handleCancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditedRow(null);
  }, []);

  // Handle row changes during inline editing
  const handleRowsChange = useCallback((rows: Item[]) => {
    const changedRow = rows.find((r) => r.id === editingRowId);
    if (changedRow) {
      setEditedRow(changedRow);
    }
  }, [editingRowId]);

  // Merge edited row into displayed rows
  const displayRows = useMemo(() => {
    if (!editingRowId || !editedRow) return paginatedRows;
    return paginatedRows.map((row) => 
      row.id === editingRowId ? editedRow : row
    );
  }, [paginatedRows, editingRowId, editedRow]);

  // 2. Define Columns
  const columns: Column<Item>[] = useMemo(() => {
    const headerClass =
      "bg-transparent text-gray-400 border-b border-gray-700 font-semibold uppercase text-xs flex items-center backdrop-blur-2xl";

    const createColumn = (
      key: keyof Item,
      name: string,
      width?: number
    ): Column<Item> => ({
      key,
      name,
      width,
      headerCellClass: headerClass,
      renderHeaderCell: (props) => (
        <HeaderWithFilter
          {...props}
          allData={data}
          filters={activeFilters}
          sortState={sortState}
          onSort={handleSort}
          onApplyFilter={handleApplyFilter}
        />
      ),
    });

    const createEditableColumn = (
      key: keyof Item,
      name: string,
      width?: number,
      isNumber: boolean = false
    ): Column<Item> => ({
      ...createColumn(key, name, width),
      editable: (row) => row.id === editingRowId,
      renderEditCell: isNumber ? NumberEditor : TextEditor,
    });

    return [
      createEditableColumn("itemName", "Item Name"),
      createEditableColumn("sku", "SKU / Barcode"),
      {
        ...createColumn("categoryName", "Category"),
        // Category is not editable inline (needs dropdown)
      },
      {
        ...createEditableColumn("costPrice", "Cost Price", 120, true),
        renderCell: ({ row }) =>
          typeof row.costPrice === "number"
            ? `₱${row.costPrice.toFixed(2)}`
            : "N/A",
      },
      {
        ...createEditableColumn("lowStockThreshold", "Low Stock", 110, true),
        renderCell: ({ row }) => (
          <div className="text-center">
             {row.lowStockThreshold ?? "—"}
          </div>
        )
      },
      createEditableColumn("description", "Description"),
      {
        key: "actions",
        name: "Actions",
        width: 120,
        headerCellClass: headerClass,
        renderCell: ({ row }) => (
          <ItemActions
            row={row}
            data={data}
            onEdit={onEdit}
            onDelete={onDelete}
            isEditing={row.id === editingRowId}
            onStartEdit={() => handleStartEdit(row)}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
          />
        ),
      },
    ];
  }, [data, activeFilters, handleApplyFilter, onEdit, onDelete, sortState, handleSort, editingRowId, handleStartEdit, handleSaveEdit, handleCancelEdit]);

  // 3. Render
  return (
    <div className="flex flex-col h-full">
      {/* Table Header / Title Area */}
      <div className="flex items-center gap-4 mb-4">
        <h3 className="font-semibold text-gray-200 text-lg">
          Registered Items
        </h3>
        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={handleClearAllFilters}
            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 border border-red-500/30 rounded text-red-400 text-xs transition-all"
          >
            <XCircle className="w-3 h-3" /> Clear All Filters
          </button>
        )}
      </div>

      {/* The Grid */}
      <DataGrid<Item>
        columns={columns}
        rows={displayRows}
        rowKeyGetter={(row) => row.id!}
        className="border-none"
        style={{ height: "63vh" }}
        rowClass={(row, index) =>
          `rdg-row bg-transparent text-[80%] text-gray-200 hover:bg-gray-700/40 border-b border-gray-800 ${row.id === editingRowId ? "ring-1 ring-blue-500/50 bg-blue-500/10" : ""}`
        }
        onRowsChange={handleRowsChange}
      />

      {/* Pagination Footer */}
      <ItemTablePagination
        startRow={startRow}
        endRow={endRow}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        paginationOptions={paginationOptions}
        onRowsPerPageChange={(newSize) => {
          setRowsPerPage(newSize);
          setCurrentPage(1);
        }}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};