// app/inventory/components/item-registration/ItemTable.tsx

"use client";

import React, { useMemo } from "react";
import { DataGrid, Column } from "react-data-grid";
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
}

export const ItemTable: React.FC<ItemTableProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
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

    return [
      createColumn("itemName", "Item Name"),
      createColumn("sku", "SKU / Barcode"),
      createColumn("categoryName", "Category"),
      {
        ...createColumn("costPrice", "Cost Price", 120),
        renderCell: ({ row }) =>
          typeof row.costPrice === "number"
            ? `₱${row.costPrice.toFixed(2)}`
            : "N/A",
      },
      // --- NEW COLUMN ADDED HERE ---
      {
        ...createColumn("lowStockThreshold", "Low Stock", 110),
        renderCell: ({ row }) => (
          <div className="text-center">
             {row.lowStockThreshold ?? "—"}
          </div>
        )
      },
      // -----------------------------
      createColumn("description", "Description"),
      {
        key: "actions",
        name: "Actions",
        width: 100,
        headerCellClass: headerClass,
        renderCell: ({ row }) => (
          <ItemActions
            row={row}
            data={data}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      },
    ];
  }, [data, activeFilters, handleApplyFilter, onEdit, onDelete, sortState, handleSort]);

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
        rows={paginatedRows}
        rowKeyGetter={(row) => row.id!}
        className="border-none"
        style={{ height: "63vh" }}
        rowClass={(_, index) =>
          `rdg-row bg-transparent text-[80%] text-gray-200 hover:bg-gray-700/40 border-b border-gray-800`
        }
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