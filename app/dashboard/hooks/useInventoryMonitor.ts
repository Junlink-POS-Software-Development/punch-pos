import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchLowStockAlerts, fetchTopInventory, fetchExpiringSoon } from "../lib/dashboard.api";

export function useInventoryMonitor() {
  // Low Stock Infinite Query
  const lowStockQuery = useInfiniteQuery({
    queryKey: ["dashboard-low-stock"],
    queryFn: ({ pageParam = 0 }) => fetchLowStockAlerts(pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer than 20 items, there are no more pages
      return lastPage.length === 20 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60, // 1 minute
  });

  // Top Inventory Infinite Query
  const topInventoryQuery = useInfiniteQuery({
    queryKey: ["dashboard-top-inventory"],
    queryFn: ({ pageParam = 0 }) => fetchTopInventory(pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer than 20 items, there are no more pages
      return lastPage.length === 20 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60, // 1 minute
  });

  // Expiring Soon Query
  const expiringSoonQuery = useQuery({
    queryKey: ["dashboard-expiring-soon"],
    queryFn: () => fetchExpiringSoon(),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    lowStockQuery,
    topInventoryQuery,
    expiringSoonQuery,
  };
}
