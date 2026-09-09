"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import dayjs from "dayjs";
import { fetchDashboardStats, fetchLatestCategorySales } from "@/app/dashboard/lib/dashboard.api";
import { fetchExpensesSummary, fetchCurrentBalance } from "@/app/cashout/lib/cashout.api";
import {
  formatPaymentRecord,
  prependPaymentToQueryCache,
  removePaymentFromQueryCache,
} from "@/app/transactions/lib/paymentCache";

/**
 * GlobalCashflowSync
 *
 * Persistent headless component mounted in RootLayout.
 * Subscribes to Supabase Realtime changes on `payments`, `transactions`, and `expenses`.
 *
 * Replaces wasteful interval polling (refetchInterval) with debounced event-driven
 * background updates. Keeps Dashboard, Cashout, and Cash Flow Ledger perpetually warm and fresh.
 */
export function GlobalCashflowSync() {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const triggerDebouncedSync = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        const todayStr = dayjs().format("YYYY-MM-DD");

        // 1. Invalidate all matching queries across the application
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
          queryClient.invalidateQueries({ queryKey: ["daily-category-sales"] }),
          queryClient.invalidateQueries({ queryKey: ["expenses"] }),
          queryClient.invalidateQueries({ queryKey: ["cash-flow-ledger"] }),
          queryClient.invalidateQueries({ queryKey: ["cash-flow-modal-ledger"] }),
          queryClient.invalidateQueries({ queryKey: ["flow-categories"] }),
          queryClient.invalidateQueries({ queryKey: ["daily-cash-flow"] }),
          queryClient.invalidateQueries({ queryKey: ["stocks"] }),
          queryClient.invalidateQueries({ queryKey: ["inventory"] }),
          queryClient.invalidateQueries({ queryKey: ["payments"] }),
          queryClient.invalidateQueries({ queryKey: ["transaction-items"] }),
        ]);

        // 2. Actively pre-warm / refetch core today's datasets in the background
        try {
          await Promise.allSettled([
            queryClient.prefetchQuery({
              queryKey: ["dashboard-stats", todayStr],
              queryFn: () => fetchDashboardStats(todayStr),
              staleTime: 1000 * 60 * 5,
            }),
            queryClient.prefetchQuery({
              queryKey: ["daily-category-sales", todayStr],
              queryFn: () => fetchLatestCategorySales(todayStr),
              staleTime: 1000 * 60 * 5,
            }),
            queryClient.prefetchQuery({
              queryKey: ["expenses", "summary", todayStr, todayStr],
              queryFn: () => fetchExpensesSummary(todayStr, todayStr),
              staleTime: 1000 * 60 * 5,
            }),
            queryClient.prefetchQuery({
              queryKey: ["expenses", "balance", todayStr],
              queryFn: () => fetchCurrentBalance(todayStr),
              staleTime: 1000 * 60 * 5,
            }),
            queryClient.refetchQueries({ queryKey: ["payments"], type: "all" }),
            queryClient.refetchQueries({ queryKey: ["transaction-items"], type: "all" }),
          ]);
        } catch (error) {
          console.error("[GlobalCashflowSync] Background prefetch error:", error);
        }
      }, 250);
    };

    const channel = supabase
      .channel("global-cashflow-realtime-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const formatted = formatPaymentRecord(payload.new as Record<string, unknown>);
            prependPaymentToQueryCache(queryClient, formatted);
          } else if (payload.eventType === "DELETE" && payload.old && (payload.old as { id?: string }).id) {
            removePaymentFromQueryCache(queryClient, (payload.old as { id: string }).id);
          }
          triggerDebouncedSync();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => triggerDebouncedSync()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => triggerDebouncedSync()
      )
      .subscribe();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null; // Headless background worker
}
