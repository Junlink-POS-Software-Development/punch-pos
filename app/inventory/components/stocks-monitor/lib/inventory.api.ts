import { createClient } from "@/utils/supabase/client";
import { extractPharmacyMeta, stripPharmacyMetaFromDescription, BrandType } from "@/lib/utils/pharmacyMeta";

const getSupabase = async () => {
  return createClient();
};

export interface InventoryItem {
  item_id: string;
  item_name: string;
  sku: string;
  category: string | null;
  unit_cost: number;
  sales_price: number | null;
  image_url: string | null;
  quantity_in: number;
  quantity_manual_out: number;
  quantity_sold: number;
  current_stock: number;
  low_stock_threshold: number | null;
  description: string | null;
  // Pharmacy & Medical fields
  generic_name?: string | null;
  dosage?: string | null;
  formulation?: string | null;
  is_rx?: boolean | null;
  brand_type?: BrandType | null;
  batch_number?: string | null;
  expiry_date?: string | null;
}

// Pagination Params
export interface InventoryParams {
  page?: number;
  limit?: number;
  storeId?: string;
  filters?: Record<string, string[]>;
  sort?: { col: keyof InventoryItem; dir: "ASC" | "DESC" };
  search?: string;
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

  // 2. Apply Search
  if (params.search) {
    // Sanitize search term to prevent PostgREST grammar parser errors (strip commas, parens)
    const cleanTerm = params.search.replace(/[,()]/g, " ").trim();
    if (cleanTerm) {
      query = query.or(`item_name.ilike.%${cleanTerm}%,sku.ilike.%${cleanTerm}%,description.ilike.%${cleanTerm}%`);
    }
  }

  // 3. Apply Sort
  if (sort) {
    query = query
      .order(sort.col, { ascending: sort.dir === "ASC" })
      .order("item_id", { ascending: true });
  } else {
    // Default alphabetical with stable secondary ID sort
    query = query
      .order("item_name", { ascending: true })
      .order("item_id", { ascending: true });
  }

  // 4. Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.warn("Inventory Fetch Warning:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    // Return empty results gracefully instead of crashing the UI
    return { data: [], count: 0 };
  }

  // 5. Map data and enrich with Pharmacy Metadata (from columns, description tag, or heuristics)
  const mappedData = (data as any[] || []).map((item) => {
    const meta = extractPharmacyMeta(item);
    return {
      ...item,
      description: stripPharmacyMetaFromDescription(item.description),
      // Fallback to cost_price if sales_price is missing
      sales_price: item.sales_price ?? item.cost_price ?? 0,
      unit_cost: item.unit_cost ?? 0,
      generic_name: meta.genericName ?? item.generic_name ?? null,
      dosage: meta.dosage ?? item.dosage ?? null,
      formulation: meta.formulation ?? item.formulation ?? null,
      is_rx: meta.isRx ?? item.is_rx ?? false,
      brand_type: meta.brandType ?? null,
      batch_number: meta.batchNumber ?? item.batch_number ?? null,
      expiry_date: meta.expiryDate ?? item.expiry_date ?? null,
    };
  });

  return { data: mappedData, count: count || 0 };
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

  const mappedData = (data as any[] || []).map((item) => ({
    ...item,
    sales_price: item.sales_price ?? item.cost_price ?? 0,
    unit_cost: item.unit_cost ?? 0,
  }));

  return { data: mappedData, count: count || 0 };
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

  const mappedData = (data as any[] || []).map((item) => ({
    ...item,
    sales_price: item.sales_price ?? item.cost_price ?? 0,
    unit_cost: item.unit_cost ?? 0,
  }));

  return { data: mappedData, count: count || 0 };
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
