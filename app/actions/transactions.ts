"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- 1. Domain Interfaces (Inputs) ---

export interface TransactionHeader {
  invoice_no: string;
  customer_name: string | null;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
  transaction_no: string;
  cashier_name: string;
}

export interface TransactionItem {
  sku: string;
  item_name: string;
  cost_price: number;
  total_price: number;
  discount: number;
  quantity: number;
}

// --- 2. Database Row Interfaces (Outputs) ---

// Inferred from your 'transactions' table filters and select(*)
export interface TransactionRecord {
  id: string; // standard supabase id
  transaction_time: string;
  invoice_no: string;
  sku: string; // Mapped from 'barcode' filter
  item_name: string; // Mapped from 'ItemName' filter
  [key: string]: string | number | boolean | null; // Allow other DB columns
}

// Inferred from your 'payments' table filters and select(*)
export interface PaymentRecord {
  id: string;
  transaction_time: string;
  invoice_no: string;
  customer_name: string | null;
  [key: string]: string | number | boolean | null; // Allow other DB columns
}

// --- 3. Filter Interfaces ---

export interface TransactionFilters {
  startDate?: string | null;
  endDate?: string | null;
  transactionNo?: string;
  barcode?: string;
  ItemName?: string;
}

export interface PaymentFilters {
  startDate?: string | null;
  endDate?: string | null;
  transactionNo?: string;
  customerName?: string;
}

// --- 4. Shared Response Type ---

// Removed default 'any' to force explicit typing
export type ActionResponse<T> =
  | { success: true; data?: T; count?: number | null }
  | { success: false; error: string };

// --- 5. Server Actions ---

export async function processTransaction(
  header: TransactionHeader,
  items: TransactionItem[]
): Promise<ActionResponse<void>> {
  // Returns void data on success
  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return { success: false, error: "SESSION_EXPIRED_PLEASE_RELOAD" };
  }

  const { error } = await supabase.rpc("insert_new_payment_and_transaction", {
    header,
    items,
  });

  if (error) {
    console.error("Transaction Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/transactions");
  return { success: true };
}

export async function getTransactionHistory(
  page: number,
  pageSize: number,
  filters: TransactionFilters
): Promise<ActionResponse<TransactionRecord[]>> {
  // Explicit Return Type
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("transactions").select("*", { count: "exact" });

  if (filters.startDate) {
    query = query.gte("transaction_time", `${filters.startDate}T00:00:00`);
  }
  if (filters.endDate) {
    query = query.lte("transaction_time", `${filters.endDate}T23:59:59`);
  }

  const columnMap: Record<string, string> = {
    transactionNo: "invoice_no",
    barcode: "sku",
    ItemName: "item_name",
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== "startDate" && key !== "endDate") {
      const dbColumn = columnMap[key];
      if (dbColumn) {
        query = query.ilike(dbColumn, `%${value as string}%`);
      }
    }
  });

  // Supabase returns generic data, so we cast it to our defined type
  const { data, error, count } = await query
    .range(from, to)
    .order("transaction_time", { ascending: false })
    .returns<TransactionRecord[]>();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [], count };
}

export async function getPaymentHistory(
  page: number,
  pageSize: number,
  filters: PaymentFilters
): Promise<ActionResponse<PaymentRecord[]>> {
  // Explicit Return Type
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("payments").select("*", { count: "exact" });

  if (filters.startDate) {
    query = query.gte("transaction_time", `${filters.startDate}T00:00:00`);
  }
  if (filters.endDate) {
    query = query.lte("transaction_time", `${filters.endDate}T23:59:59`);
  }

  const columnMap: Record<string, string> = {
    transactionNo: "invoice_no",
    customerName: "customer_name",
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value && key !== "startDate" && key !== "endDate") {
      const dbColumn = columnMap[key];
      if (dbColumn) {
        query = query.ilike(dbColumn, `%${value as string}%`);
      }
    }
  });

  const { data, error, count } = await query
    .range(from, to)
    .order("transaction_time", { ascending: false })
    .returns<PaymentRecord[]>();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data || [], count };
}
