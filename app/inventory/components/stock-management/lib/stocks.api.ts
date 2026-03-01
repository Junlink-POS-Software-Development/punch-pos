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
  expiry_date: string | null;
  batch_remaining: number | null;
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
      store_id,
      expiry_date,
      batch_remaining
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
  expiryDate?: string;
}) => {
  console.log("🚀 [API] Sending Stock Payload:", data);

  const supabase = await getSupabase();

  // 1. Check if item exists in 'items' table
  const { data: existingItem, error: itemError } = await supabase
    .from("items")
    .select("id")
    .eq("item_name", data.itemName)
    .single();

  if (itemError || !existingItem) {
    console.error("❌ [API] Item not found:", data.itemName);
    throw new Error(`Item "${data.itemName}" is not registered. Please register it first.`);
  }

  // We wrap the RPC call in withTimeout to ensure it fails if the network hangs
  const { error } = await withTimeout(
    supabase.rpc("insert_new_stock_item", {
      item_name_in: data.itemName,
      flow_in: data.stockFlow,
      quantity_in: data.quantity,
      capital_price_in: data.capitalPrice,
      notes_in: data.notes ?? null,
      expiry_date_in: data.expiryDate ?? null,
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

// 5. Batch Insert Stock
export const insertStockBatch = async (items: {
  itemId?: string;
  itemName: string;
  stockFlow: string;
  quantity: number;
  capitalPrice: number;
  notes?: string;
  expiryDate?: string;
}[]) => {
  console.log("🚀 [API] Sending Batch Stock Payload:", items.length, "items");
  const supabase = await getSupabase();

  // 1. Get current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication failed. Please log in again.");
  }

  // 2. Fetch user's store_id
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (userError || !userData?.store_id) {
    console.error("❌ [API] Failed to fetch user store_id:", userError);
    throw new Error("Could not determine your store. Please contact support.");
  }

  const storeId = userData.store_id;

  // 3. Prepare payload for batch insert
  // We explicitly include item_id, user_id, and store_id to pass RLS and constraints.
  const payload = items.map(i => ({
    item_id: i.itemId,
    item_name: i.itemName, // keep for history/convenience if column exists
    flow: i.stockFlow,
    quantity: i.quantity,
    capital_price: i.capitalPrice,
    notes: i.notes ?? "Batch Update",
    expiry_date: i.expiryDate ?? null,
    batch_remaining: i.stockFlow === "stock-in" ? i.quantity : 0,
    user_id: user.id,
    store_id: storeId,
  }));
  
  const { data, error } = await supabase
    .from("stock_flow")
    .insert(payload)
    .select();

  if (error) {
    console.error("❌ [API] Batch Insert Error:", error);
    // If we get an RLS error here, it likely means one of the store_ids didn't match
    throw new Error(error.message);
  }
  
  return data;
};
