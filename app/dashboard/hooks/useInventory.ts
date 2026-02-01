
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInventory, fetchLowStockItems, fetchMostStockedItems, InventoryItem, InventoryParams } from "../../inventory/components/stocks-monitor/lib/inventory.api";

export const useInventoryInfinite = (params?: Partial<InventoryParams>) => {
  const queryClient = useQueryClient();
  
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
    staleTime: 1000 * 60 * 2, // 2 mins
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
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["inventory-all-pos"],
    queryFn: async () => fetchInventory({ limit: 1000, page: 1 }), // Fetch large chunk for POS
  });

  return { 
    inventory: data?.data || [], 
    totalCount: data?.count || 0,
    isLoading, 
    error: isError, 
    refetch 
  };
};
