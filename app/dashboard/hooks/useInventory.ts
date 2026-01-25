import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInventory } from "../../inventory/components/stocks-monitor/lib/inventory.api";

export const useInventory = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["inventory-monitor"],
    queryFn: () => fetchInventory(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: "always",
  });

  return {
    inventory: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
