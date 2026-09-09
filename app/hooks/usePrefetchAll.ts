"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import dayjs from "dayjs";

// Import the actual fetchers
import { fetchDashboardStats, fetchDrawerMode, fetchLatestCategorySales } from "@/app/dashboard/lib/dashboard.api";
import { fetchItems } from "@/app/inventory/components/item-registration/lib/item.api";
import { fetchExpensesSummary, fetchCurrentBalance, fetchExpensesPaginated } from "@/app/cashout/lib/cashout.api";
import { fetchFlowCategories, fetchCashFlowLedger } from "@/app/cashout/lib/cashflow.api";
import { fetchCustomerFeatureData } from "@/app/customers/lib/customer.api";
import { getPaymentHistory } from "@/app/actions/transactions";
import {
  formatPaymentRecord,
  DEFAULT_PAYMENT_PAGE_SIZE,
} from "@/app/transactions/lib/paymentCache";

interface PrefetchTask {
  key: readonly unknown[];
  fn: () => Promise<unknown>;
  isInfinite?: boolean;
}

export function usePrefetchAll() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const prefetchAll = useCallback(async () => {
    setProgress(0);
    const todayStr = dayjs().format("YYYY-MM-DD");
    const monthStart = dayjs().startOf("month").format("YYYY-MM-DD");
    const monthEnd = dayjs().endOf("month").format("YYYY-MM-DD");
    const todayRange = { start: todayStr, end: todayStr };
    const monthRange = { start: monthStart, end: monthEnd };

    const tasks: PrefetchTask[] = [
      // 1. Dashboard Stats
      {
        key: ["dashboard-stats", todayStr],
        fn: () => fetchDashboardStats(todayStr),
      },
      // 2. Drawer Mode
      {
        key: ["drawer-mode"],
        fn: () => fetchDrawerMode(),
      },
      // 3. Category Sales
      {
        key: ["daily-category-sales", todayStr],
        fn: () => fetchLatestCategorySales(todayStr),
      },
      // 4. Inventory Items
      {
        key: ["items"],
        fn: () => fetchItems(),
      },
      // 5. Expenses / Cashouts (aligned with useFilterStore default { start: today, end: today })
      {
        key: ["expenses", "summary", todayStr, todayStr],
        fn: () => fetchExpensesSummary(todayStr, todayStr),
      },
      {
        key: ["expenses", "balance", todayStr],
        fn: () => fetchCurrentBalance(todayStr),
      },
      {
        key: ["expenses", "infinite", 20, todayRange],
        fn: () => fetchExpensesPaginated(1, 20, todayStr, todayStr).then(res => ({
          pages: [{ data: res.data, count: res.count, nextPage: res.data.length === 20 ? 2 : undefined }],
          pageParams: [1]
        })),
        isInfinite: true,
      },
      // 6. Flow Categories & Cash Flow Modal Ledger
      {
        key: ["flow-categories"],
        fn: () => fetchFlowCategories(),
      },
      {
        key: ["cash-flow-modal-ledger", "Overall", monthRange],
        fn: () => fetchCashFlowLedger("Overall", monthRange),
      },
      // 7. Customers list
      {
        key: ["customer-feature-data", todayStr, todayStr, false],
        fn: () => fetchCustomerFeatureData(todayStr, todayStr),
      },
      // 8. Payment Transactions (initial 50 records)
      {
        key: ["payments", DEFAULT_PAYMENT_PAGE_SIZE, { startDate: "", endDate: "" }],
        fn: async () => {
          const res = await getPaymentHistory(1, DEFAULT_PAYMENT_PAGE_SIZE, {});
          if (!res.success) throw new Error(res.error);
          const rows = res.data || [];
          const formattedData = rows.map((p) => formatPaymentRecord(p));
          return {
            pages: [
              {
                data: formattedData,
                count: res.count || 0,
                nextPage: rows.length === DEFAULT_PAYMENT_PAGE_SIZE ? 2 : undefined,
              },
            ],
            pageParams: [1],
          };
        },
        isInfinite: true,
      },
    ];

    let completed = 0;
    const total = tasks.length;

    // Execute fetches in parallel but track individual completions for progress
    await Promise.allSettled(
      tasks.map(async (task) => {
        try {
          if (task.isInfinite) {
            const data = await task.fn();
            queryClient.setQueryData(task.key, data);
          } else {
            await queryClient.prefetchQuery({
              queryKey: task.key,
              queryFn: task.fn,
              staleTime: 1000 * 60 * 60 * 24, // Keep it fresh for 24 hours while offline
            });
          }
        } catch (error) {
          console.error(`[Offline Prefetch] Failed to fetch ${task.key}:`, error);
        } finally {
          completed++;
          setProgress(Math.round((completed / total) * 100));
        }
      })
    );
    
    // Ensure it hits 100% just in case
    setProgress(100);

  }, [queryClient]);

  return {
    prefetchAll,
    progress,
  };
}
