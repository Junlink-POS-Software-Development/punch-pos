// app/inventory/components/item-registration/ItemTablePagination.tsx

"use client";

import React from "react";

interface ItemTablePaginationProps {
  startRow: number;
  endRow: number;
  totalRows: number;
  rowsPerPage: number;
  paginationOptions: number[];
  onRowsPerPageChange: (newSize: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const ItemTablePagination: React.FC<ItemTablePaginationProps> = ({
  startRow,
  endRow,
  totalRows,
  rowsPerPage,
  paginationOptions,
  onRowsPerPageChange,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex justify-between items-center gap-4 bg-gray-900/50 p-3 border-gray-800 border-t text-sm">
      <div className="text-gray-400">
        Showing {startRow} - {endRow} of {totalRows} items
      </div>

      <div className="flex items-center gap-4">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="rowsPerPage" className="text-gray-400">
            Rows:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
            }}
            className="bg-gray-800 p-1 border border-gray-700 focus:border-blue-500 rounded focus:ring-1 focus:ring-blue-500 text-sm"
          >
            {paginationOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-2 py-1 rounded disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-2 font-medium text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalRows === 0}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 px-2 py-1 rounded disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
