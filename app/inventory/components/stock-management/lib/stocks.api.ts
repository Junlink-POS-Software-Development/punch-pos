import { supabase } from "@/lib/supabaseClient";

export interface StockData {
  id: string;
  item_name: string;
  flow: string;
  quantity: number;
  capital_price: number;
  notes: string | null;
  time_stamp: string;
  user_id: string;
  admin_users_id: string;
  store_id: string;
}

// 1. Fetch Stocks
// (No change needed - RLS will handle security)
export const fetchStocks = async (): Promise<StockData[]> => {
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
      admin_users_id,
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

// 2. Insert Stock (--- THIS IS THE UPDATED FUNCTION ---)
// Calls a secure database function to handle multitenant logic.
export const insertStock = async (data: {
  itemName: string;
  stockFlow: string;
  quantity: number;
  capitalPrice: number;
  notes?: string;
}) => {
  // Call the database function
  const { error } = await supabase.rpc("insert_new_stock_item", {
    item_name_in: data.itemName,
    flow_in: data.stockFlow,
    quantity_in: data.quantity,
    capital_price_in: data.capitalPrice,
    notes_in: data.notes ?? null,
  });

  if (error) {
    console.error("Insert Error:", error);
    throw new Error(error.message);
  }
};

// 3. Delete Stock
// (No change needed - RLS will handle security)
export const deleteStock = async (id: string) => {
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
