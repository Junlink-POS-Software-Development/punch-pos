import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export interface Drawer {
  id: string;
  category: string; // The drawer name is stored in 'category' column
  store_id: string;
}

const fetchDrawers = async (): Promise<Drawer[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("product_category")
    .select("id, category, store_id")
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching drawers:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export function useDrawers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["drawers"],
    queryFn: fetchDrawers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    drawers: data || [],
    isLoading,
    error,
  };
}
