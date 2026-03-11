"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useCustomerData } from "../../hooks/useCustomerData";
import { Calendar, User, FileText, Search, ArrowUpDown } from "lucide-react";
import { DateColumnFilter } from "@/app/cashout/components/shared/DateColumnFilter";
import { useCustomerStore } from "../../store/useCustomerStore";

// ─── Memoized Row Component ──────────────────────────────────────────────────
const MemoizedTransactionRow = React.memo(({ transaction }: { transaction: any }) => {
  return (
    <tr
      key={transaction.invoice_no}
      className="group hover:bg-accent/20 transition-colors"
    >
      <td className="px-4 py-1.5 font-mono font-bold text-xs text-primary/80">
        {transaction.invoice_no}
      </td>
      <td className="px-4 py-1.5">
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center bg-amber-500/10 rounded-full w-7 h-7 text-amber-500 shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm truncate max-w-[150px]">{transaction.customer_name}</span>
        </div>
      </td>
      <td className="px-4 py-1.5 text-[11px] text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          <Calendar className="opacity-40 w-3 h-3" />
          <span className="whitespace-nowrap">
            {new Date(transaction.transaction_time).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </td>
      <td className="px-4 py-1.5 text-right">
        <span className="font-mono font-bold text-xs text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded">
          ₱{Number(transaction.grand_total).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </span>
      </td>
      <td className="px-4 py-1.5 text-center">
        <span
          title={transaction.cashier_id}
          className="text-[10px] font-bold text-muted-foreground/60 border-b border-dotted border-border cursor-help hover:text-foreground transition-colors"
        >
          View ID
        </span>
      </td>
    </tr>
  );
});

MemoizedTransactionRow.displayName = "MemoizedTransactionRow";

export const GuestTransactionsTable = () => {
  const { guestTransactions, isLoading, startDate, endDate, handleDateChange } = useCustomerData();
  const isHeaderCollapsed = useCustomerStore((s) => s.isHeaderCollapsed);
  const setHeaderCollapsed = useCustomerStore((s) => s.setHeaderCollapsed);
  const [visibleCount, setVisibleCount] = useState(50);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const frameId = useRef<number | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const delta = currentScrollY - lastScrollY.current;

    if (frameId.current) cancelAnimationFrame(frameId.current);
    
    frameId.current = requestAnimationFrame(() => {
      if (currentScrollY > 100 && delta > 30) {
        if (!isHeaderCollapsed) setHeaderCollapsed(true);
      } else if (currentScrollY < 100 || delta < -30) {
        if (isHeaderCollapsed) setHeaderCollapsed(false);
      }
      lastScrollY.current = currentScrollY;
    });
  };

  useEffect(() => {
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, []);

  const pagedTransactions = useMemo(() => {
    return guestTransactions.slice(0, visibleCount);
  }, [guestTransactions, visibleCount]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < guestTransactions.length) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, guestTransactions.length]);

  if (isLoading) {
    return (
      <div className="p-10 text-muted-foreground text-center">Loading records...</div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Filter Toolbar */}
      <div className="flex justify-between items-center bg-card/30 p-3 border border-border rounded-xl">
        <DateColumnFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          align="start"
        />
        <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
          {guestTransactions.length > 0 ? (
            <>{guestTransactions.length} Record{guestTransactions.length !== 1 ? 's' : ''}</>
          ) : (
            <>No records found</>
          )}
        </div>
      </div>

      {/* Empty State or Table */}
      {guestTransactions.length === 0 ? (
        <div className="flex flex-col flex-1 justify-center items-center bg-card/20 border-2 border-border/50 border-dashed rounded-xl p-8">
          <div className="bg-accent mb-3 p-4 rounded-full">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <p className="font-bold text-muted-foreground text-lg">No Guest Transactions Found</p>
          <p className="text-muted-foreground/60 text-xs">Adjust the date filter above to expand your search.</p>
        </div>
      ) : (
        <div className="flex-1 bg-card shadow-md border border-border rounded-2xl overflow-hidden flex flex-col">
          <div 
            onScroll={handleScroll}
            className="flex-1 overflow-auto custom-scrollbar"
          >
            <table className="w-full text-left border-collapse">
              <thead className="top-0 z-10 sticky bg-muted/30 backdrop-blur-md font-bold text-muted-foreground text-[10px] uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-2">Invoice #</th>
                  <th className="px-4 py-2">Customer Name</th>
                  <th className="px-4 py-2">Date & Time</th>
                  <th className="px-4 py-2 text-right">Total Amount</th>
                  <th className="px-4 py-2 text-center">Cashier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 will-change-transform translate-z-0">
                {pagedTransactions.map((tx) => (
                  <MemoizedTransactionRow 
                    key={tx.invoice_no} 
                    transaction={tx} 
                  />
                ))}
              </tbody>
            </table>
            {visibleCount < guestTransactions.length && (
              <div ref={loadMoreRef} className="py-4 text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest animate-pulse">
                Loading more transactions...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
