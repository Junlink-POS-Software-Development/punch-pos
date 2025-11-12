// lib/item.api.ts

import { supabase } from "@/lib/supabaseClient";
import { Item } from "../utils/itemTypes"; // Adjust path as needed

// ---
// --- TYPES & MAPPERS
// ---

// The type for the row as it comes from Supabase (snake_case)
type SupabaseItemRow = {
  id: string;
  item_name: string;
  sku: string;
  category: string;
  cost_price: number;
  description: string | null;
  created_at?: string;
};

// Helper to map from Supabase (snake_case) to our app (camelCase)
const mapRowToItem = (row: SupabaseItemRow): Item => ({
  id: row.id,
  itemName: row.item_name,
  sku: row.sku,
  category: row.category,
  costPrice: row.cost_price,
  description: row.description ?? "",
});

// Helper to map from our app (camelCase) to Supabase (snake_case)
const mapItemToPayload = (item: Omit<Item, "id">) => ({
  item_name: item.itemName,
  sku: item.sku,
  category: item.category,
  cost_price: item.costPrice,
  description: item.description,
});

// ---
// --- EXPORTED API FUNCTIONS
// ---

/**
 * Fetches all items from the database
 */
export const fetchItems = async (): Promise<Item[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data.map(mapRowToItem);
};

/**
 * Inserts a new item into the database
 */
export const insertItem = async (item: Item): Promise<Item> => {
  const insertPayload = mapItemToPayload(item);

  const { data, error } = await supabase
    .from("items")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return mapRowToItem(data as SupabaseItemRow);
};

/**
 * Updates an existing item in the database
 */
export const updateItem = async (item: Item): Promise<Item> => {
  if (!item.id) throw new Error("ID is required for an update.");

  const updatePayload = mapItemToPayload(item);

  const { data, error } = await supabase
    .from("items")
    .update(updatePayload)
    .eq("id", item.id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return mapRowToItem(data as SupabaseItemRow);
};

/**
 * Deletes an item from the database by its ID
 */
export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    throw error;
  }
};

export const checkItemExistence = async (
  field: "sku" | "itemName",
  value: string,
  ignoreId?: string
): Promise<boolean> => {
  // Supabase uses 'item_name' for item name
  const dbField = field === "itemName" ? "item_name" : field;

  let query = supabase
    .from("items")
    // Select only 'id' for a quick count
    .select("id", { count: "exact" })
    .eq(dbField, value);

  // If we are editing an item, exclude its own ID from the check
  if (ignoreId) {
    query = query.neq("id", ignoreId);
  }

  const { count, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }
  // Returns true if count > 0
  return (count ?? 0) > 0;
};
