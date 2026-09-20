import { createClient } from "@/utils/supabase/client";
import { Item } from "../utils/itemTypes";
import { embedPharmacyMetaInDescription, extractPharmacyMeta, stripPharmacyMetaFromDescription } from "@/lib/utils/pharmacyMeta";

const getSupabase = async () => {
  return createClient();
};

// 1. UPDATE: Interface to include the new column from RPC
interface ItemDbRow {
  id: string;
  item_name: string;
  sku: string;
  category_id: string | null;
  category_name: string | null;
  unit_cost: number;
  sales_price: number | null;
  description: string | null;
  image_url: string | null;
  low_stock_threshold: number | null;
  // Pharmacy extensions
  generic_name?: string | null;
  dosage?: string | null;
  formulation?: string | null;
  is_rx?: boolean;
}

// ... (DbItemObject and toDatabaseObject remain UNCHANGED) ...
type DbItemObject = Partial<ItemDbRow>;

const toDatabaseObject = (item: Partial<Item>): DbItemObject => {
  const dbItem: DbItemObject = {};
  if (item.id !== undefined) dbItem.id = item.id;
  if (item.sku !== undefined) dbItem.sku = item.sku;
  if (item.itemName !== undefined) dbItem.item_name = item.itemName;
  if (item.salesPrice !== undefined) dbItem.unit_cost = item.salesPrice;
  if (item.sellingPrice !== undefined) dbItem.sales_price = item.sellingPrice ?? null;
  // Map JS 'category' (UUID) -> DB 'category_id'
  if (item.category !== undefined) dbItem.category_id = item.category ?? null;
  if (item.imageUrl !== undefined) dbItem.image_url = item.imageUrl ?? null;
  if (item.lowStockThreshold !== undefined) dbItem.low_stock_threshold = item.lowStockThreshold ?? null;

  // Pharmacy & Medical fields
  if (item.genericName !== undefined) dbItem.generic_name = item.genericName ?? null;
  if (item.dosage !== undefined) dbItem.dosage = item.dosage ?? null;
  if (item.formulation !== undefined) dbItem.formulation = item.formulation ?? null;
  if (item.isRx !== undefined) dbItem.is_rx = item.isRx ?? false;

  // Embed pharmacy meta in description so it's queryable & persistent immediately
  if (item.genericName || item.dosage || item.formulation || item.isRx !== undefined || item.brandType) {
    dbItem.description = embedPharmacyMetaInDescription(item.description || "", {
      genericName: item.genericName || undefined,
      dosage: item.dosage || undefined,
      formulation: item.formulation || undefined,
      isRx: item.isRx,
      brandType: item.brandType,
      batchNumber: item.batchNumber || undefined,
      expiryDate: item.expiryDate || undefined,
    });
  } else if (item.description !== undefined) {
    dbItem.description = item.description ?? null;
  }

  return dbItem;
};

// 2. UPDATE: Mapper to handle the new field
const fromDatabaseObject = (dbItem: ItemDbRow): Item => {
  const { 
    item_name, 
    unit_cost,
    sales_price,
    category_id, 
    category_name,
    description,
    image_url,
    low_stock_threshold,
    id, 
    sku,
    generic_name,
    dosage,
    formulation,
    is_rx,
  } = dbItem;

  const meta = extractPharmacyMeta(dbItem);

  return {
    id,
    itemName: item_name,
    sku,
    category: category_id ?? undefined,
    categoryName: category_name ?? undefined,
    salesPrice: unit_cost,
    sellingPrice: sales_price ?? null,
    description: stripPharmacyMetaFromDescription(description) || undefined,
    imageUrl: image_url ?? null,
    lowStockThreshold: low_stock_threshold ?? null,
    genericName: meta.genericName ?? generic_name ?? undefined,
    dosage: meta.dosage ?? dosage ?? undefined,
    formulation: meta.formulation ?? formulation ?? undefined,
    isRx: meta.isRx ?? is_rx ?? false,
    brandType: meta.brandType ?? "branded",
    batchNumber: meta.batchNumber ?? undefined,
    expiryDate: meta.expiryDate ?? undefined,
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
    .select(`
      *,
      product_category (
        category
      )
    `, { count: "exact" })
    .order("item_name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Supabase fetch paginated error:", error);
    throw new Error(error.message);
  }

  // Map the join result
  const mappedData = (data as (any)[]).map((item) => {
    // Standardize the object for fromDatabaseObject
    const dbItem: ItemDbRow = {
      id: item.id,
      item_name: item.item_name,
      sku: item.sku,
      category_id: item.category_id,
      category_name: item.product_category?.category ?? null,
      unit_cost: item.unit_cost,
      sales_price: item.sales_price ?? null,
      description: item.description,
      image_url: item.image_url ?? null,
      low_stock_threshold: item.low_stock_threshold,
    };
    return fromDatabaseObject(dbItem);
  });

  return { data: mappedData, count: count ?? 0 };
};



export const insertItem = async (item: Item): Promise<Item> => {
  const supabase = await getSupabase();

  const dbItem = toDatabaseObject(item);
  
  // Fetch current user's store_id to ensure RLS 'WITH CHECK' passes
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (userError) {
    console.error("Failed to fetch user store_id for insertion:", userError);
  } else if (userData?.store_id) {
    (dbItem as ItemDbRow & { store_id: string }).store_id = userData.store_id;
  }
  
  let { data: insertedData, error } = await supabase
    .from("items")
    .insert(dbItem)
    .select()
    .single();

  if (error) {
    // Graceful fallback if database migration hasn't been applied yet
    if (error.message?.includes("generic_name") || error.message?.includes("is_rx") || error.code === "PGRST204") {
      console.warn("Pharmacy columns missing in Supabase schema cache. Retrying base insert. Run migration 20260920010000_add_pharmacy_fields_and_item_batches.sql.");
      const fallbackItem = { ...dbItem };
      delete fallbackItem.generic_name;
      delete fallbackItem.dosage;
      delete fallbackItem.formulation;
      delete fallbackItem.is_rx;
      const retry = await supabase
        .from("items")
        .insert(fallbackItem)
        .select()
        .single();
      if (retry.error) {
        throw new Error(retry.error.message);
      }
      insertedData = retry.data;
    } else {
      console.error("Supabase insert error:", error);
      throw new Error(error.message);
    }
  }

  return fromDatabaseObject(insertedData);
};

export const updateItem = async (item: Item): Promise<Item> => {
  if (!item.id) throw new Error("Item ID is required for update");

  const dbItem = toDatabaseObject(item); 
  // IMPORTANT: Remove 'id' from the update payload. 
  // It's used in the .eq() filter, and some databases/RLS might object to it being in the body.
  const { id: _, ...updateData } = dbItem;

  const supabase = await getSupabase();
  let { data, error } = await supabase
    .from("items")
    .update(updateData)
    .eq("id", item.id)
    .select()
    .single();

  if (error) {
    if (error.message?.includes("generic_name") || error.message?.includes("is_rx") || error.code === "PGRST204") {
      console.warn("Pharmacy columns missing in Supabase schema cache. Retrying base update.");
      const fallbackData = { ...updateData };
      delete fallbackData.generic_name;
      delete fallbackData.dosage;
      delete fallbackData.formulation;
      delete fallbackData.is_rx;
      const retry = await supabase
        .from("items")
        .update(fallbackData)
        .eq("id", item.id)
        .select()
        .single();
      if (retry.error) {
        throw new Error(retry.error.message);
      }
      data = retry.data;
    } else {
      console.error("Supabase update error detail:", JSON.stringify(error, null, 2));
      throw new Error(error.message);
    }
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