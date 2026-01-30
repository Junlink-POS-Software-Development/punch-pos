"use server";

import { createClient } from "@/utils/supabase/server";
import { Item } from "../utils/itemTypes";

const getSupabase = async () => {
  return await createClient();
};

// 1. UPDATE: Interface to include the new column from RPC
interface ItemDbRow {
  id: string;
  item_name: string;
  sku: string;
  category_id: string | null;
  category_name: string | null; // New field from RPC
  cost_price: number;
  description: string | null;
  low_stock_threshold: number | null;
}

// ... (DbItemObject and toDatabaseObject remain UNCHANGED) ...
type DbItemObject = Partial<ItemDbRow>;

const toDatabaseObject = (item: Partial<Item>): DbItemObject => {
  const dbItem: DbItemObject = {};
  if (item.id !== undefined) dbItem.id = item.id;
  if (item.sku !== undefined) dbItem.sku = item.sku;
  if (item.itemName !== undefined) dbItem.item_name = item.itemName;
  if (item.costPrice !== undefined) dbItem.cost_price = item.costPrice;
  // Map JS 'category' (UUID) -> DB 'category_id'
  if (item.category !== undefined) dbItem.category_id = item.category ?? null;
  if (item.description !== undefined) dbItem.description = item.description ?? null;
  if (item.lowStockThreshold !== undefined) dbItem.low_stock_threshold = item.lowStockThreshold ?? null;
  return dbItem;
};

// 2. UPDATE: Mapper to handle the new field
const fromDatabaseObject = (dbItem: ItemDbRow): Item => {
  const { 
    item_name, 
    cost_price, 
    category_id, 
    category_name, // Destructure the new field
    description, 
    low_stock_threshold, 
    ...rest 
  } = dbItem;
  
  return {
    ...rest,
    itemName: item_name,
    costPrice: cost_price,
    // Keep 'category' as ID so your "Select" inputs in forms still work
    category: category_id ?? undefined,
    // NEW: Map 'categoryName' for your UI Table
    // (Ensure you add 'categoryName?: string' to your Item type definition)
    categoryName: category_name ?? undefined, 
    description: description ?? undefined,
    lowStockThreshold: low_stock_threshold ?? null,
  };
};

// --- API Functions ---

export const fetchItems = async (): Promise<Item[]> => {
  const supabase = await getSupabase();
  
  // 3. UPDATE: Call the RPC function
  const { data, error } = await supabase
    .rpc('get_items_with_category');

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }

  return data.map(fromDatabaseObject);
};

export const fetchItemsPaginated = async (
  page: number,
  pageSize: number
): Promise<{ data: Item[]; count: number }> => {
  const supabase = await getSupabase();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // We use standard select to support pagination easily
  // Table name is 'product_category', column name is 'category'
  const { data, error, count } = await supabase
    .from("items")
    .select("*, product_category(category)", { count: "exact" })
    .order("item_name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Supabase fetch paginated error:", error);
    throw new Error(error.message);
  }

  // Map the join result
  const mappedData = data.map((item: any) => {
    // Standardize the object for fromDatabaseObject
    const dbItem: ItemDbRow = {
      id: item.id,
      item_name: item.item_name,
      sku: item.sku,
      category_id: item.category_id,
      category_name: item.product_category?.category ?? null,
      cost_price: item.cost_price,
      description: item.description,
      low_stock_threshold: item.low_stock_threshold,
    };
    return fromDatabaseObject(dbItem);
  });

  return { data: mappedData, count: count ?? 0 };
};



export const insertItem = async (item: Item): Promise<Item> => {
  const supabase = await getSupabase();

  
  const dbItem = toDatabaseObject(item);
  
  const { data, error } = await supabase
    .from("items")
    .insert(dbItem)
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message);
  }

  return fromDatabaseObject(data);
};

export const updateItem = async (item: Item): Promise<Item> => {
  if (!item.id) throw new Error("Item ID is required for update");

  const dbItem = toDatabaseObject(item); // Maps item.category -> dbItem.category_id

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

  // 1. Delete dependent stock_flow records first
  const { error: stockError } = await supabase
    .from("stock_flow")
    .delete()
    .eq("item_id", id);

  if (stockError) {
    console.error("Supabase delete stock_flow error:", stockError);
    throw new Error(stockError.message);
  }

  // 2. Delete the item
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
    return toDatabaseObject(rest); // Correctly maps categories to IDs
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