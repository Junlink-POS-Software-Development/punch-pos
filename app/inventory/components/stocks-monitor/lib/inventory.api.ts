"use server";

import { createClient } from "@/utils/supabase/server";

const getSupabase = async () => {
  return await createClient();
};

export interface InventoryItem {
  item_id: string;
  item_name: string;
  sku: string;
  category: string | null;
  cost_price: number;
  quantity_in: number;
  quantity_out: number;
  quantity_sold: number;
  current_stock: number;
  low_stock_threshold: number | null;
}

export const fetchInventory = async (
  storeId?: string
): Promise<InventoryItem[]> => {
  // Create a timeout promise that rejects after 10 seconds
  const timeoutPromise = new Promise<InventoryItem[]>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request timed out"));
    }, 10000);
  });

  const fetchPromise = (async () => {
    const supabase = await getSupabase();
    let query = supabase
      .from("inventory_monitor_view")
      .select("*")
      .order("current_stock", { ascending: true }); // Show low stock items first

    // Optional: Filter by store if your app handles multiple stores at once
    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Inventory Fetch Error:", error);
      throw new Error(error.message);
    }

    return data || [];
  })();

  // Race the fetch against the timeout
  return Promise.race([fetchPromise, timeoutPromise]);
};
