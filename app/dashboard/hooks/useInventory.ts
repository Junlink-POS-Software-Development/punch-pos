import useSWR from "swr";
import { fetchInventory } from "../../inventory/components/stocks-monitor/lib/inventory.api";

export const useInventory = () => {
  const { data, isLoading, error, mutate } = useSWR(
    "inventory-monitor",
    () => fetchInventory(),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  return {
    inventory: data || [],
    isLoading,
    error: error as Error | null,
    refetch: mutate,
  };
};
