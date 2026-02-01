"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { Loader2, AlertCircle, XCircle, Trash2 } from "lucide-react";
import { usePaymentData } from "../../hooks/usePaymentData";
import { DateColumnFilter } from "@/app/expenses/components/cashout/components/DateColumnFilter";
import { HeaderWithFilter } from "@/components/reusables/HeaderWithFilter";
import { deletePayment } from "@/app/actions/transactions";
import { useState } from "react";

export const PaymentHistoryTable = () => {
  // 1. Consume Context
  const {
    payments,
    totalRows,
    isLoading,
    isError,
    error,
    filters,
    setFilters,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refresh
  } = usePaymentData();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0,
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  const handleDateChange = (start: string, end: string) => {
    setFilters({ ...filters, startDate: start, endDate: end });
  };

  const handleApplyFilter = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClearAllFilters = () => {
    setFilters({ startDate: "", endDate: "" });
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => key !== "startDate" && key !== "endDate" && filters[key]
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this payment record? This will also delete all associated items and is irreversible.")) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deletePayment(id);
      if (result.success) {
        refresh();
      } else {
        alert(`Failed to delete payment: ${result.error}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An unexpected error occurred while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

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

      <div className="overflow-x-auto flex-1 overflow-y-auto">
        <table className="w-full text-slate-300 text-sm text-left">
          <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm text-slate-400 text-xs uppercase shadow-sm">
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
              <th className="px-6 py-3 font-bold text-green-400 text-right">
                Change
              </th>
              <th className="px-6 py-3 rounded-tr-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
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
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(pay.id)}
                      disabled={deletingId === pay.id}
                      className={`p-2 rounded-md transition-all ${
                        deletingId === pay.id
                          ? "bg-slate-700 text-slate-500"
                          : "hover:bg-red-400/20 text-red-400 hover:text-red-200"
                      }`}
                      title="Delete Payment"
                    >
                      {deletingId === pay.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Sentinel for Infinite Scroll */}
        <div ref={observerTarget} className="h-4 w-full" />
        
        {isFetchingNextPage && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        )}
      </div>

      <div className="p-2 text-xs text-slate-500 text-center border-t border-slate-700/50">
        Showing {payments.length} of {totalRows} records
      </div>
    </div>
  );
};