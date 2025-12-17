// app/inventory/components/item-registration/lib/item.api.ts

"use server";

import { createClient } from "@/utils/supabase/server";

const getSupabase = async () => {
  return await createClient();
};
import { Item } from "../utils/itemTypes";

// 1. Interface for the database row (snake_case)
interface ItemDbRow {
  id: string;
  item_name: string;
  sku: string;
  category: string | null;
  cost_price: number;
  description: string | null;
  low_stock_threshold: number | null;
}

// 2. NEW: A specific type for the object we send to Supabase
// This is a Partial version of a DB row, replacing 'any'
type DbItemObject = Partial<ItemDbRow>;

// 3. FIX: 'toDatabaseObject' is now fully type-safe, with NO 'any'
// It explicitly maps fields from the JS 'Item' to the 'DbItemObject'
const toDatabaseObject = (item: Partial<Item>): DbItemObject => {
  const dbItem: DbItemObject = {};

  // Pass-through fields (if they exist on the partial item)
  if (item.id !== undefined) dbItem.id = item.id;
  if (item.sku !== undefined) dbItem.sku = item.sku;

  // Mapped fields
  if (item.itemName !== undefined) dbItem.item_name = item.itemName;
  if (item.costPrice !== undefined) dbItem.cost_price = item.costPrice;

  // Mapped fields that handle 'undefined' -> 'null'
  if (item.category !== undefined) {
    dbItem.category = item.category ?? null;
  }
  if (item.description !== undefined) {
    dbItem.description = item.description ?? null;
  }
  if (item.lowStockThreshold !== undefined) {
    dbItem.low_stock_threshold = item.lowStockThreshold ?? null;
  }

  return dbItem;
};

// 4. 'fromDatabaseObject' remains the same, correctly typed
// Maps DB snake_case (ItemDbRow) to JS camelCase (Item)

const fromDatabaseObject = (dbItem: ItemDbRow): Item => {
  const { item_name, cost_price, category, description, low_stock_threshold, ...rest } = dbItem;
  return {
    ...rest,
    itemName: item_name,
    costPrice: cost_price,
    // Convert 'null' from DB to 'undefined' for Zod/react-hook-form
    category: category ?? undefined,
    description: description ?? undefined,
    lowStockThreshold: low_stock_threshold ?? null,
  };
};

// --- API Functions (No further changes needed) ---

export const fetchItems = async (): Promise<Item[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("items")
    .select("id, sku, category, description, item_name, cost_price, low_stock_threshold");

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }

  return data.map(fromDatabaseObject);
};

export const insertItem = async (item: Item): Promise<Item> => {
  const supabase = await getSupabase();
  // We map the Item object to the RPC parameters
  const { data, error } = await supabase.rpc("insert_item_secure", {
    p_item_name: item.itemName,
    p_sku: item.sku,
    p_cost_price: item.costPrice,
    p_category_name: item.category || null,
    p_description: item.description || null,
    p_low_stock_threshold: item.lowStockThreshold || null,
  });

  if (error) {
    console.error("Supabase insert_item_secure error:", error);
    throw new Error(error.message);
  }

  // The RPC returns the raw DB row, so we convert it back to your CamelCase Item type
  return fromDatabaseObject(data);
};

export const updateItem = async (item: Item): Promise<Item> => {
  if (!item.id) throw new Error("Item ID is required for update");

  const dbItem = toDatabaseObject(item); // 'item' includes 'id'

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("items")
    .update(dbItem)
    .eq("id", item.id)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    throw new Error(error.message);
  }
  return fromDatabaseObject(data);
};

export const deleteItem = async (id: string): Promise<void> => {
  const supabase = await getSupabase();
  const { error } = await supabase.from("items").delete().eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    throw new Error(error.message);
  }
};

export const checkItemExistence = async (
  field: "itemName" | "sku",
  value: string,
  ignoreId?: string
): Promise<boolean> => {
  const dbField = field === "itemName" ? "item_name" : "sku";

  const supabase = await getSupabase();
  let query = supabase
    .from("items")
    .select("id", { count: "exact", head: true })
    .eq(dbField, value);

  if (ignoreId) {
    query = query.not("id", "eq", ignoreId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Supabase check existence error:", error);
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
};

export const insertManyItems = async (items: Item[]): Promise<Item[]> => {
  const itemsToInsert = items.map((item) => {
    const { id, ...rest } = item;
    return toDatabaseObject(rest);
  });

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("items")
    .insert(itemsToInsert)
    .select();

  if (error) {
    console.error("Supabase insertMany error:", error);
    throw new Error(error.message);
  }

  return data.map(fromDatabaseObject);
};
