// app/inventory/components/item-registration/ItemTable.tsx

"use client";

import React, { useMemo } from "react";
import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { Item } from "../utils/itemTypes";
import { Edit, Trash2, XCircle } from "lucide-react";

// 1. Import the new hook and components
import { useProcessedItems } from "./hooks/useProcessedItems";
import { HeaderWithFilter } from "./HeaderWithFilter";
import { ItemTablePagination } from "./ItemTablePagination";

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
  // 2. Call the hook to get all state and logic
  const {
    paginatedRows,
    totalRows,
    activeFilters,
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

  // 3. Columns definition remains, but is now much cleaner
  const columns: Column<Item>[] = useMemo(() => {
    const tailwindHeaderClass =
      "bg-transparent text-gray-400 border-b border-gray-700 font-semibold uppercase text-xs flex items-center backdrop-blur-2xl ";

    const createColumn = (
      key: keyof Item,
      name: string,
      width?: number
    ): Column<Item> => ({
      key,
      name,
      width,
      headerCellClass: tailwindHeaderClass,
      renderHeaderCell: (props) => (
        <HeaderWithFilter
          {...props}
          allData={data} // Pass original data for filter options
          filters={activeFilters}
          onApplyFilter={handleApplyFilter}
        />
      ),
    });

    return [
      createColumn("itemName", "Item Name"),
      createColumn("sku", "SKU / Barcode"),
      createColumn("category", "Category"),
      {
        ...createColumn("costPrice", "Cost Price", 120),
        renderCell: ({ row }) =>
          typeof row.costPrice === "number"
            ? `₱${row.costPrice.toFixed(2)}`
            : "N/A",
      },
      createColumn("description", "Description"),
      {
        key: "actions",
        name: "Actions",
        width: 100,
        headerCellClass: tailwindHeaderClass,
        renderCell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const originalIndex = data.findIndex((i) => i.id === row.id);
                if (originalIndex !== -1) onEdit(originalIndex);
              }}
              className="hover:bg-blue-400/20 p-1 rounded text-blue-300 hover:text-blue-100"
              title="Edit Item"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const originalIndex = data.findIndex((i) => i.id === row.id);
                if (originalIndex !== -1) onDelete(originalIndex);
              }}
              className="hover:bg-red-400/20 p-1 rounded text-red-400 hover:text-red-200"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [data, activeFilters, onEdit, onDelete, handleApplyFilter]);

  // 4. The render is now just layout and prop-drilling
  return (
    <div className="flex flex-col h-full">
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

      <DataGrid<Item>
        columns={columns}
        rows={paginatedRows} // Use paginated rows from hook
        rowKeyGetter={(row: Item) => row.id!}
        className="border-none"
        style={{ height: "63vh" }}
        rowClass={(_, index) =>
          `rdg-row bg-transparent text-[80%] text-gray-200 hover:bg-gray-700/40 border-b border-gray-800`
        }
      />

      <ItemTablePagination
        startRow={startRow}
        endRow={endRow}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        paginationOptions={paginationOptions}
        onRowsPerPageChange={(newSize) => {
          setRowsPerPage(newSize);
          setCurrentPage(1); // Reset to page 1 on size change
        }}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={(newPage) => {
          setCurrentPage(newPage);
        }}
      />
    </div>
  );
};
