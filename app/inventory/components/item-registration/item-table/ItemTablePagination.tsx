import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  startRow: number;
  endRow: number;
  totalRows: number;
  rowsPerPage: number;
  paginationOptions: number[];
  onRowsPerPageChange: (size: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ItemTablePagination: React.FC<PaginationProps> = ({
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
    <div className="flex justify-between items-center bg-gray-900/50 p-4 border-gray-800 border-t">
      <div className="text-gray-400 text-xs">
        Showing{" "}
        <span className="font-medium text-gray-200">
          {totalRows > 0 ? startRow + 1 : 0}
        </span>{" "}
        to <span className="font-medium text-gray-200">{endRow}</span> of{" "}
        <span className="font-medium text-gray-200">{totalRows}</span> results
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="bg-gray-800 p-1 border border-gray-700 focus:border-gray-500 rounded outline-none text-gray-200 text-xs"
          >
            {paginationOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="hover:bg-gray-800 disabled:hover:bg-transparent disabled:opacity-30 p-1 rounded text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="min-w-[3rem] text-gray-400 text-xs text-center">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="hover:bg-gray-800 disabled:hover:bg-transparent disabled:opacity-30 p-1 rounded text-gray-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
