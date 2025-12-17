"use server";

import { createClient } from "@/utils/supabase/server";

const getSupabase = async () => {
  return await createClient();
};

export interface StockData {
  id: string;
  item_name: string;
  flow: string;
  quantity: number;
  capital_price: number;
  notes: string | null;
  time_stamp: string;
  user_id: string;
  store_id: string;
}

// --- HELPER: Prevent Infinite Hanging ---
const withTimeout = <T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]) as Promise<T>;
};

// 1. Fetch Stocks
// (No change needed - RLS will handle security)
export const fetchStocks = async (): Promise<StockData[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("stock_flow")
    .select(
      `
      id,
      item_name,
      flow,
      quantity,
      capital_price,
      notes,
      time_stamp,
      user_id,
      store_id
    `
    )
    .order("time_stamp", { ascending: false });

  if (error) {
    console.error("Fetch Error:", error);
    throw new Error(error.message);
  }
  return data || [];
};

// 2. Insert Stock (--- UPDATED WITH TIMEOUT & LOGGING ---)
// Calls a secure database function to handle multitenant logic.
export const insertStock = async (data: {
  itemName: string;
  stockFlow: string;
  quantity: number;
  capitalPrice: number;
  notes?: string;
}) => {
  console.log("🚀 [API] Sending Stock Payload:", data);

  const supabase = await getSupabase();
  // We wrap the RPC call in withTimeout to ensure it fails if the network hangs
  const { error } = await withTimeout(
    supabase.rpc("insert_new_stock_item", {
      item_name_in: data.itemName,
      flow_in: data.stockFlow,
      quantity_in: data.quantity,
      capital_price_in: data.capitalPrice,
      notes_in: data.notes ?? null,
    }),
    10000, // 10-second timeout
    "Insert Stock RPC"
  );

  if (error) {
    console.error("❌ [API] Insert Error:", error);
    throw new Error(error.message);
  }
};

// 3. Delete Stock
// (No change needed - RLS will handle security)
export const deleteStock = async (id: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase.from("stock_flow").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// 4. Update Stock
// (No change needed - RLS will handle security)
export const updateStock = async (data: {
  id: string;
  flow: string;
  quantity: number;
  capital_price: number;
  notes?: string;
}) => {
  const supabase = await getSupabase();
  const { data: result, error } = await supabase
    .from("stock_flow")
    .update({
      flow: data.flow,
      quantity: data.quantity,
      capital_price: data.capital_price,
      notes: data.notes ?? null,
    })
    .eq("id", data.id)
    .select();

  if (error) {
    console.error("Update Error:", error);
    throw new Error(error.message);
  }
  return result;
};
