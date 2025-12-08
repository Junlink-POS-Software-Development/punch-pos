import { useQuery } from "@tanstack/react-query";
import { fetchInventory, InventoryItem } from "../components/stocks-monitor/lib/inventory.api";

export const useInventory = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["inventory-monitor"],
    queryFn: () => fetchInventory(),
    refetchInterval: (query) => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        return 30000;
      }
      return false;
    },
    refetchOnWindowFocus: 'always',
    staleTime: 30000,
  });

  return {
    inventory: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
