import { createClient } from "@/utils/supabase/client";
import { Item } from "../utils/itemTypes";
import { embedPharmacyMetaInDescription, extractPharmacyMeta, stripPharmacyMetaFromDescription } from "@/lib/utils/pharmacyMeta";
import { embedGroceryMetaInDescription, extractGroceryMeta, stripGroceryMetaFromDescription } from "@/lib/utils/groceryMeta";

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
  // Grocery extensions
  is_weighed?: boolean;
  unit_of_measure?: string;
  plu_code?: string | null;
  tare_weight?: number;
  pack_barcode?: string | null;
  pack_quantity?: number;
  pack_selling_price?: number | null;
  is_perishable?: boolean;
}

// Extended columns added in migrations that may not exist in some database environments
const EXTENDED_COLUMNS: (keyof ItemDbRow)[] = [
  "generic_name",
  "dosage",
  "formulation",
  "is_rx",
  "is_weighed",
  "unit_of_measure",
  "plu_code",
  "tare_weight",
  "pack_barcode",
  "pack_quantity",
  "pack_selling_price",
  "is_perishable",
];

const stripExtendedColumns = (payload: DbItemObject): DbItemObject => {
  const stripped = { ...payload };
  for (const col of EXTENDED_COLUMNS) {
    delete stripped[col];
  }
  return stripped;
};

const isSchemaColumnError = (error: any): boolean => {
  if (!error) return false;
  if (error.code === "PGRST204") return true;
  const msg = (error.message || "").toLowerCase();
  if (msg.includes("column") || msg.includes("schema cache") || msg.includes("does not exist")) return true;
  return EXTENDED_COLUMNS.some((col) => msg.includes(col.toLowerCase()));
};

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

  // Grocery & Weighed fields
  if (item.isWeighed !== undefined) dbItem.is_weighed = item.isWeighed ?? false;
  if (item.unitOfMeasure !== undefined) dbItem.unit_of_measure = item.unitOfMeasure ?? "pc";
  if (item.pluCode !== undefined) dbItem.plu_code = item.pluCode ?? null;
  if (item.tareWeight !== undefined) dbItem.tare_weight = item.tareWeight ?? 0;
  if (item.packBarcode !== undefined) dbItem.pack_barcode = item.packBarcode ?? null;
  if (item.packQuantity !== undefined) dbItem.pack_quantity = item.packQuantity ?? 1;
  if (item.packSellingPrice !== undefined) dbItem.pack_selling_price = item.packSellingPrice ?? null;
  if (item.isPerishable !== undefined) dbItem.is_perishable = item.isPerishable ?? false;

  // Embed pharmacy meta in description so it's queryable & persistent immediately
  let desc = item.description || "";
  if (item.genericName || item.dosage || item.formulation || item.isRx !== undefined || item.brandType) {
    desc = embedPharmacyMetaInDescription(desc, {
      genericName: item.genericName || undefined,
      dosage: item.dosage || undefined,
      formulation: item.formulation || undefined,
      isRx: item.isRx,
      brandType: item.brandType,
      batchNumber: item.batchNumber || undefined,
      expiryDate: item.expiryDate || undefined,
    });
  }

  // Embed grocery meta in description for guaranteed backward compatibility
  if (item.isWeighed || item.pluCode || item.packBarcode || item.unitOfMeasure !== "pc" || item.isPerishable) {
    desc = embedGroceryMetaInDescription(desc, {
      isWeighed: item.isWeighed,
      unitOfMeasure: (item.unitOfMeasure as any) || "pc",
      pluCode: item.pluCode || undefined,
      tareWeight: item.tareWeight || 0,
      packBarcode: item.packBarcode || undefined,
      packQuantity: item.packQuantity || 1,
      packSellingPrice: item.packSellingPrice || undefined,
      isPerishable: item.isPerishable || false,
    });
  }

  dbItem.description = desc ? desc : (item.description ?? null);

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
    is_weighed,
    unit_of_measure,
    plu_code,
    tare_weight,
    pack_barcode,
    pack_quantity,
    pack_selling_price,
    is_perishable,
  } = dbItem;

  const pharmacyMeta = extractPharmacyMeta(dbItem);
  const groceryMeta = extractGroceryMeta(dbItem);

  // Clean description of both metadata tags
  const cleanDesc = stripGroceryMetaFromDescription(stripPharmacyMetaFromDescription(description));

  return {
    id,
    itemName: item_name,
    sku,
    category: category_id ?? undefined,
    categoryName: category_name ?? undefined,
    salesPrice: unit_cost,
    sellingPrice: sales_price ?? null,
    description: cleanDesc || undefined,
    imageUrl: image_url ?? null,
    lowStockThreshold: low_stock_threshold ?? null,
    genericName: pharmacyMeta.genericName ?? generic_name ?? undefined,
    dosage: pharmacyMeta.dosage ?? dosage ?? undefined,
    formulation: pharmacyMeta.formulation ?? formulation ?? undefined,
    isRx: pharmacyMeta.isRx ?? is_rx ?? false,
    brandType: pharmacyMeta.brandType ?? "branded",
    batchNumber: pharmacyMeta.batchNumber ?? undefined,
    expiryDate: pharmacyMeta.expiryDate ?? undefined,
    // Grocery fields
    isWeighed: groceryMeta.isWeighed ?? is_weighed ?? false,
    unitOfMeasure: groceryMeta.unitOfMeasure ?? unit_of_measure ?? "pc",
    pluCode: groceryMeta.pluCode ?? plu_code ?? undefined,
    tareWeight: groceryMeta.tareWeight ?? tare_weight ?? 0,
    packBarcode: groceryMeta.packBarcode ?? pack_barcode ?? undefined,
    packQuantity: groceryMeta.packQuantity ?? pack_quantity ?? 1,
    packSellingPrice: groceryMeta.packSellingPrice ?? pack_selling_price ?? null,
    isPerishable: groceryMeta.isPerishable ?? is_perishable ?? false,
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
  console.log("🌐 [item.api] insertItem invoked with item:", item);
  const supabase = await getSupabase();

  const dbItem = toDatabaseObject(item);
  console.log("🛠️ [item.api] Initial toDatabaseObject output:", dbItem);
  
  // Fetch current user's store_id to ensure RLS 'WITH CHECK' passes
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;
  console.log("👤 [item.api] Current auth user id:", currentUserId);

  if (currentUserId) {
    (dbItem as any).user_id = currentUserId;
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", currentUserId)
      .single();

    if (userError) {
      console.warn("⚠️ [item.api] Failed to fetch user store_id for insertion:", userError);
    } else if (userData?.store_id) {
      (dbItem as ItemDbRow & { store_id: string }).store_id = userData.store_id;
      console.log("🏪 [item.api] Bound store_id to item payload:", userData.store_id);
    }
  }
  
  console.log("💾 [item.api] Inserting item into 'items' table:", dbItem);
  let { data: insertedData, error } = await supabase
    .from("items")
    .insert(dbItem)
    .select()
    .single();

  if (error) {
    console.warn("⚠️ [item.api] Primary insert failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });

    if (isSchemaColumnError(error)) {
      console.warn("⚠️ [item.api] Extended columns missing in Supabase schema cache. Retrying base insert with metadata safely preserved in description tag...");
      const fallbackItem = stripExtendedColumns(dbItem);
      console.log("🔄 [item.api] Retrying insert with stripped fallback payload:", fallbackItem);

      const retry = await supabase
        .from("items")
        .insert(fallbackItem)
        .select()
        .single();

      if (retry.error) {
        console.error("❌ [item.api] Fallback insert failed:", retry.error);
        throw new Error(retry.error.message);
      }
      console.log("✅ [item.api] Fallback insert succeeded! Created row:", retry.data);
      insertedData = retry.data;
    } else {
      console.error("❌ [item.api] Supabase insert error:", error);
      throw new Error(error.message);
    }
  } else {
    console.log("✅ [item.api] Primary insert succeeded! Created row:", insertedData);
  }

  const mapped = fromDatabaseObject(insertedData);
  console.log("📦 [item.api] Returning mapped Item:", mapped);
  return mapped;
};

export const updateItem = async (item: Item): Promise<Item> => {
  if (!item.id) throw new Error("Item ID is required for update");
  console.log("🌐 [item.api] updateItem invoked for item ID:", item.id, item);

  const dbItem = toDatabaseObject(item); 
  // IMPORTANT: Remove 'id' from the update payload. 
  // It's used in the .eq() filter, and some databases/RLS might object to it being in the body.
  const { id: _, ...updateData } = dbItem;
  console.log("🛠️ [item.api] Updating payload:", updateData);

  const supabase = await getSupabase();
  let { data, error } = await supabase
    .from("items")
    .update(updateData)
    .eq("id", item.id)
    .select()
    .single();

  if (error) {
    console.warn("⚠️ [item.api] Primary update failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
    });

    if (isSchemaColumnError(error)) {
      console.warn("⚠️ [item.api] Extended columns missing in Supabase schema cache. Retrying base update...");
      const fallbackData = stripExtendedColumns(updateData as DbItemObject);
      console.log("🔄 [item.api] Retrying update with stripped fallback payload:", fallbackData);

      const retry = await supabase
        .from("items")
        .update(fallbackData)
        .eq("id", item.id)
        .select()
        .single();

      if (retry.error) {
        console.error("❌ [item.api] Fallback update failed:", retry.error);
        throw new Error(retry.error.message);
      }
      console.log("✅ [item.api] Fallback update succeeded! Updated row:", retry.data);
      data = retry.data;
    } else {
      console.error("❌ [item.api] Supabase update error detail:", JSON.stringify(error, null, 2));
      throw new Error(error.message);
    }
  } else {
    console.log("✅ [item.api] Primary update succeeded! Updated row:", data);
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
  console.log("🌐 [item.api] insertManyItems invoked with count:", items.length);
  const supabase = await getSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData?.user?.id;

  let storeId: string | undefined;
  if (currentUserId) {
    const { data: userData } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", currentUserId)
      .single();
    storeId = userData?.store_id;
    console.log("🏪 [item.api] Found store_id for batch insert:", storeId);
  }

  const itemsToInsert = items.map((item) => {
    const { id, ...rest } = item;
    const dbItem = toDatabaseObject(rest);
    if (storeId) (dbItem as any).store_id = storeId;
    if (currentUserId) (dbItem as any).user_id = currentUserId;
    return dbItem;
  });

  console.log("🚀 [item.api] Executing Supabase insertMany with items count:", itemsToInsert.length);
  let { data, error } = await supabase
    .from("items")
    .insert(itemsToInsert)
    .select();

  if (error) {
    console.warn("⚠️ [item.api] Primary insertMany failed:", error);
    if (isSchemaColumnError(error)) {
      console.warn("⚠️ [item.api] Extended columns missing in Supabase schema cache for insertMany. Retrying base insertMany...");
      const fallbackItems = itemsToInsert.map((item) => stripExtendedColumns(item));
      const retry = await supabase
        .from("items")
        .insert(fallbackItems)
        .select();

      if (retry.error) {
        console.error("❌ [item.api] Fallback insertMany failed:", retry.error);
        throw new Error(retry.error.message);
      }
      console.log("✅ [item.api] Fallback insertMany succeeded! Inserted count:", retry.data?.length);
      data = retry.data;
    } else {
      console.error("❌ [item.api] Supabase insertMany error:", error);
      throw new Error(error.message);
    }
  } else {
    console.log("✅ [item.api] Primary insertMany succeeded! Inserted count:", data?.length);
  }

  return (data || []).map(fromDatabaseObject);
};