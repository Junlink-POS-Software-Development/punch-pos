// app/inventory/lib/batch.api.ts
import { createClient } from "@/utils/supabase/client";

export interface ItemBatch {
  id: string;
  store_id: string;
  item_id: string;
  batch_number: string;
  expiry_date: string; // ISO format: YYYY-MM-DD
  stock_quantity: number;
  cost_price?: number;
  created_at?: string;
  item_name?: string;
  sku?: string;
}

export interface InsertBatchPayload {
  item_id: string;
  batch_number: string;
  expiry_date: string;
  stock_quantity: number;
  cost_price?: number;
}

const getSupabase = async () => createClient();

/**
 * Fetch batches for a specific item ordered by Expiry Date ASC (FEFO principle)
 */
export const fetchItemBatches = async (itemId: string): Promise<ItemBatch[]> => {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("item_batches")
    .select("*")
    .eq("item_id", itemId)
    .gt("stock_quantity", 0)
    .order("expiry_date", { ascending: true });

  if (error) {
    // If table doesn't exist yet, return empty list gracefully
    console.warn("fetchItemBatches notice:", error.message);
    return [];
  }

  return (data || []) as ItemBatch[];
};

/**
 * Fetch all batches for the current store, ordered by earliest expiry (FEFO)
 */
export const fetchStoreBatches = async (): Promise<ItemBatch[]> => {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("item_batches")
    .select(`
      *,
      items (
        item_name,
        sku
      )
    `)
    .gt("stock_quantity", 0)
    .order("expiry_date", { ascending: true });

  if (error) {
    console.warn("fetchStoreBatches notice:", error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    store_id: row.store_id,
    item_id: row.item_id,
    batch_number: row.batch_number,
    expiry_date: row.expiry_date,
    stock_quantity: Number(row.stock_quantity),
    cost_price: Number(row.cost_price || 0),
    created_at: row.created_at,
    item_name: row.items?.item_name,
    sku: row.items?.sku,
  }));
};

/**
 * Insert a new batch for an item
 */
export const insertItemBatch = async (
  payload: InsertBatchPayload
): Promise<ItemBatch | null> => {
  const supabase = await getSupabase();

  // Get current store_id
  const { data: userData } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!userData?.store_id) {
    console.error("Store ID not found for batch insert");
    return null;
  }

  const { data, error } = await supabase
    .from("item_batches")
    .insert({
      store_id: userData.store_id,
      item_id: payload.item_id,
      batch_number: payload.batch_number,
      expiry_date: payload.expiry_date,
      stock_quantity: payload.stock_quantity,
      cost_price: payload.cost_price || 0,
    })
    .select()
    .single();

  if (error) {
    console.warn("insertItemBatch notice:", error.message);
    return null;
  }

  return data as ItemBatch;
};

/**
 * Calculate expiry status helper:
 * - 'expired': expiry date is in the past
 * - 'critical': expiring within 30 days
 * - 'warning': expiring within 90 days
 * - 'good': > 90 days
 */
export const getExpiryStatus = (expiryDateStr: string): {
  status: 'expired' | 'critical' | 'warning' | 'good';
  daysRemaining: number;
  label: string;
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining, label: `Expired ${Math.abs(daysRemaining)}d ago` };
  }
  if (daysRemaining <= 30) {
    return { status: 'critical', daysRemaining, label: `Expiring in ${daysRemaining}d` };
  }
  if (daysRemaining <= 90) {
    return { status: 'warning', daysRemaining, label: `Expiring in ${daysRemaining}d` };
  }
  return { status: 'good', daysRemaining, label: `Good (${daysRemaining}d left)` };
};
