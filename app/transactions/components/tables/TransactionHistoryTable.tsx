"use client";

import React from "react";
import { Loader2, AlertCircle, XCircle } from "lucide-react";
import { useTransactionContext } from "../../context/TransactionContext"; // New Import
import { ItemTablePagination } from "@/components/reusables/ItemTablePagination";
import { DateRangeFilter } from "@/components/reusables/DateRangeFilter";
import { HeaderWithFilter } from "@/components/reusables/HeaderWithFilter";

export const TransactionHistoryTable = () => {
  // Use Context instead of local state/hooks
  const {
    transactions,
    totalRows,
    isLoading,
    isError,
    error,
    currentPage,
    rowsPerPage,
    filters,
    setCurrentPage,
    setRowsPerPage,
    setFilters
  } = useTransactionContext();

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // --- Handlers (Simplified to use Context Setters) ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setCurrentPage(1);
  };

  const handleDateChange = (key: "startDate" | "endDate", value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const handleClearDates = () => {
    setFilters({ ...filters, startDate: "", endDate: "" });
    setCurrentPage(1);
  };

  const handleApplyFilter = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setFilters({ startDate: "", endDate: "" });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => key !== "startDate" && key !== "endDate" && filters[key]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-10 rounded-lg glass-effect">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-10 rounded-lg text-red-400 glass-effect">
        <AlertCircle className="w-5 h-5" />
        <span>Error loading history: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg h-full overflow-hidden glass-effect">
      {/* Filters Toolbar */}
      <div className="flex justify-between items-center bg-slate-800/30 p-4 border-slate-700 border-b">
        <DateRangeFilter
          startDate={filters.startDate || ""}
          endDate={filters.endDate || ""}
          onStartDateChange={(val) => handleDateChange("startDate", val)}
          onEndDateChange={(val) => handleDateChange("endDate", val)}
          onClear={handleClearDates}
        />
        
        {hasActiveFilters && (
          <button onClick={handleClearAllFilters} className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 border border-red-500/30 rounded text-red-400 text-xs transition-all">
            <XCircle className="w-3 h-3" /> Clear Column Filters
          </button>
        )}
      </div>

      {/* Table Body (Same as before) */}
      <div className="overflow-x-auto">
        <table className="w-full text-slate-300 text-sm text-left">
           {/* ... Table Header and Body logic remains identical, using 'transactions' array ... */}
           {/* Copy existing Table logic here */}
           <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">
                <HeaderWithFilter
                  column={{ key: "transactionNo", name: "Invoice Ref" }}
                  filters={filters as Record<string, string>}
                  onApplyFilter={handleApplyFilter}
                />
              </th>
               {/* ... other headers ... */}
               <th className="px-6 py-3 whitespace-nowrap">Item Name</th>
               <th className="px-6 py-3 text-right whitespace-nowrap">Price</th>
               <th className="px-6 py-3 text-right whitespace-nowrap">Qty</th>
               <th className="px-6 py-3 font-bold text-white text-right whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
               <tr><td colSpan={7} className="px-6 py-8 text-slate-500 text-center">No transactions found.</td></tr>
            ) : (
              transactions.map((item, index) => (
                <tr key={`${item.transactionNo}-${index}`} className="hover:bg-slate-800/30 border-slate-700 border-b transition-colors">
                  <td className="px-6 py-4 text-slate-500 text-xs">{item.transactionNo}</td>
                  {/* ... other cells ... */}
                  <td className="px-6 py-4 font-medium text-white">{item.ItemName}</td>
                  <td className="px-6 py-4 text-right">₱{item.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 font-bold text-cyan-400 text-right">₱{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-auto">
        <ItemTablePagination
          startRow={(currentPage - 1) * rowsPerPage}
          endRow={Math.min(currentPage * rowsPerPage, totalRows)}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          paginationOptions={[10, 20, 50, 100]}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};