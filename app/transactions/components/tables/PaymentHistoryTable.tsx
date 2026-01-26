"use client";

import React from "react";
import { Loader2, AlertCircle, XCircle } from "lucide-react";
import { usePaymentData } from "../../hooks/usePaymentData"; // New Import
import { ItemTablePagination } from "@/components/reusables/ItemTablePagination";
import { DateColumnFilter } from "@/app/expenses/components/cashout/components/DateColumnFilter";
import { HeaderWithFilter } from "@/components/reusables/HeaderWithFilter";

export const PaymentHistoryTable = () => {
  // 1. Consume Context
  const {
    payments,
    totalRows,
    isLoading,
    isError,
    error,
    currentPage,
    rowsPerPage,
    filters,
    setCurrentPage,
    setRowsPerPage,
    setFilters,
  } = usePaymentData();

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // 2. Handlers (Now update the Context state)
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowsPerPageChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setCurrentPage(1); // Reset to first page
  };

  const handleDateChange = (start: string, end: string) => {
    setFilters({ ...filters, startDate: start, endDate: end });
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

  // 3. UI States
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
        <span>Error loading payments: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg h-full overflow-hidden glass-effect">
      {/* --- Filters Toolbar --- */}
      <div className="flex justify-between items-center bg-slate-800/30 p-4 border-slate-700 border-b">
        <DateColumnFilter
          startDate={filters.startDate || ""}
          endDate={filters.endDate || ""}
          onDateChange={handleDateChange}
          align="start"
        />
        
        {hasActiveFilters && (
          <button
            onClick={handleClearAllFilters}
            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 border border-red-500/30 rounded text-red-400 text-xs transition-all"
          >
            <XCircle className="w-3 h-3" /> Clear Column Filters
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-slate-300 text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 rounded-tl-lg">
                <HeaderWithFilter
                  column={{ key: "transactionNo", name: "Invoice No" }}
                  filters={filters as Record<string, string>}
                  onApplyFilter={handleApplyFilter}
                />
              </th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">
                <HeaderWithFilter
                  column={{ key: "customerName", name: "Customer" }}
                  filters={filters as Record<string, string>}
                  onApplyFilter={handleApplyFilter}
                />
              </th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-right">Payment</th>
              <th className="px-6 py-3 text-blue-400 text-right">Voucher</th>
              <th className="px-6 py-3 rounded-tr-lg font-bold text-green-400 text-right">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-slate-500 text-center"
                >
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((pay, index) => (
                <tr
                  key={index}
                  className="hover:bg-slate-800/30 border-slate-700 border-b transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-slate-400">
                    {pay.transactionNo}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {pay.transactionTime}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {pay.customerName || (
                      <span className="opacity-50 italic">Walk-in</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-right">
                    ₱{(pay.grandTotal ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    ₱{(pay.amountRendered ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-blue-400 text-right">
                    {pay.voucher > 0 ? `₱${(pay.voucher ?? 0).toFixed(2)}` : "-"}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-400 text-right">
                    ₱{(pay.change ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Component --- */}
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