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

// Pagination Params
export interface InventoryParams {
  page?: number;
  limit?: number;
  storeId?: string;
  filters?: Record<string, string[]>;
  sort?: { col: keyof InventoryItem; dir: "ASC" | "DESC" };
}

export const fetchInventory = async (
  params: InventoryParams = {}
): Promise<{ data: InventoryItem[]; count: number }> => {
  const { page = 1, limit = 50, filters, sort } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await getSupabase();
  let query = supabase
    .from("inventory_monitor_view")
    .select("*", { count: "exact" });

  // 1. Apple Filters
  if (filters) {
    Object.keys(filters).forEach((key) => {
      const values = filters[key];
      if (values && values.length > 0) {
        // Handle "category" separately? usually exact match works
        query = query.in(key, values);
      }
    });
  }

  // 2. Apply Sort
  if (sort) {
    query = query.order(sort.col, { ascending: sort.dir === "ASC" });
  } else {
    // Default alphabetical
    query = query.order("item_name", { ascending: true });
  }

  // 3. Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Inventory Fetch Error:", error);
    throw new Error(error.message);
  }

  return { data: data || [], count: count || 0 };
};

// Pagination helper
const getRange = (page: number, limit: number) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
};

export const fetchLowStockItems = async (page = 1, limit = 20) => {
  const supabase = await getSupabase();
  const { from, to } = getRange(page, limit);

  const { data, error, count } = await supabase
    .from("inventory_monitor_view")
    .select("*", { count: "exact" })
    .lte("current_stock", 5)
    .order("item_name", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data || [], count: count || 0 };
};

export const fetchMostStockedItems = async (page = 1, limit = 20) => {
  const supabase = await getSupabase();
  const { from, to } = getRange(page, limit);

  const { data, error, count } = await supabase
    .from("inventory_monitor_view")
    .select("*", { count: "exact" })
    .order("current_stock", { ascending: false })
    .order("item_name", { ascending: true })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data || [], count: count || 0 };
};

// Deprecated: kept to avoid breaking immediate imports before refactor completion
export const fetchInventoryStats = async (limit = 5) => {
   const [low, most] = await Promise.all([
      fetchLowStockItems(1, limit),
      fetchMostStockedItems(1, limit)
   ]);
   return {
      lowStockItems: low.data,
      mostStockedItems: most.data
   };
};
