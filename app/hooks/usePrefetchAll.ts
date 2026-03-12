"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import dayjs from "dayjs";

// Import the actual fetchers
import { fetchDashboardStats, fetchDrawerMode, fetchLatestCategorySales } from "@/app/dashboard/lib/dashboard.api";
import { fetchItems } from "@/app/inventory/components/item-registration/lib/item.api";
import { fetchExpenses, fetchExpensesSummary } from "@/app/cashout/lib/cashout.api";
import { fetchCustomerFeatureData } from "@/app/customers/lib/customer.api";

export function usePrefetchAll() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const prefetchAll = useCallback(async () => {
    setProgress(0);
    const todayStr = dayjs().format("YYYY-MM-DD");

    const tasks = [
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
      // 5. Expenses / Cashouts
      {
        key: ["expenses", "list", undefined, undefined],
        fn: () => fetchExpenses(undefined, undefined),
      },
      {
        key: ["expenses", "summary", undefined, undefined],
        fn: () => fetchExpensesSummary(undefined, undefined),
      },
      // 6. Customers list
      {
        key: ["customer-feature-data", todayStr, todayStr, false],
        fn: () => fetchCustomerFeatureData(todayStr, todayStr),
      },
    ];

    let completed = 0;
    const total = tasks.length;

    // Execute fetches in parallel but track individual completions for progress
    await Promise.allSettled(
      tasks.map(async (task) => {
        try {
          await queryClient.prefetchQuery({
            queryKey: task.key,
            queryFn: task.fn,
            staleTime: 1000 * 60 * 60 * 24, // Keep it fresh for 24 hours while offline
          });
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
