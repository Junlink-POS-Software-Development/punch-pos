
import { useEffect } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInventory, fetchLowStockItems, fetchMostStockedItems, InventoryParams } from "../../inventory/components/stocks-monitor/lib/inventory.api";
import { createClient } from "@/utils/supabase/client";

/**
 * Subscribes to Supabase Realtime changes on `stock_flow` and `transactions` tables.
 * On any change, invalidates all inventory-related React Query caches so components refetch fresh data.
 */
const useRealtimeInventory = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("inventory-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_flow" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
          queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
          queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
          queryClient.invalidateQueries({ queryKey: ["inventory-most-stocked"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["inventory-infinite"] });
          queryClient.invalidateQueries({ queryKey: ["inventory-all-pos"] });
          queryClient.invalidateQueries({ queryKey: ["inventory-low-stock"] });
          queryClient.invalidateQueries({ queryKey: ["inventory-most-stocked"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

export const useInventoryInfinite = (params?: Partial<InventoryParams>) => {
  const queryClient = useQueryClient();

  // Subscribe to realtime updates
  useRealtimeInventory();
  
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["inventory-infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      return fetchInventory({ ...params, page: pageParam, limit: 50 });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < 50) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 0, // Always refetch on invalidation for fresh stock data
  });

  const allRows = data?.pages.flatMap((p) => p.data) || [];
  const totalCount = data?.pages[0]?.count || 0;

  return {
    inventory: allRows,
    totalCount,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};

export const useLowStockInfinite = () => {
  return useInfiniteQuery({
    queryKey: ["inventory-low-stock"],
    queryFn: async ({ pageParam = 1 }) => fetchLowStockItems(pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < 20) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};

export const useMostStockedInfinite = () => {
  return useInfiniteQuery({
    queryKey: ["inventory-most-stocked"],
    queryFn: async ({ pageParam = 1 }) => fetchMostStockedItems(pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < 20) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};

/* Legacy hook restored for POS compatibility - Fetches a large chunk of inventory */
export const useInventory = () => {
  // Subscribe to realtime updates
  useRealtimeInventory();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["inventory-all-pos"],
    queryFn: async () => fetchInventory({ limit: 1000, page: 1 }), // Fetch large chunk for POS
    staleTime: 0, // Always refetch on invalidation for fresh stock data
  });

  return { 
    inventory: data?.data || [], 
    totalCount: data?.count || 0,
    isLoading, 
    error: isError, 
    refetch 
  };
};
