import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInventory } from "../../inventory/components/stocks-monitor/lib/inventory.api";

export const useInventory = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["inventory-monitor"],
    queryFn: () => fetchInventory(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });

  return {
    inventory: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
