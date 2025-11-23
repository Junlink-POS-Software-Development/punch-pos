// lib/inventory.api.ts
import { supabase } from "@/lib/supabaseClient";

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
}

export const fetchInventory = async (
  storeId?: string
): Promise<InventoryItem[]> => {
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
};
