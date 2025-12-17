"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function processTransaction(header: any, items: any[]) {
  const supabase = await createClient();

  // 1. Check Session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return { success: false, error: "SESSION_EXPIRED_PLEASE_RELOAD" };
  }

  // 2. Insert Transaction
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

export async function getTransactionHistory(page: number, pageSize: number, filters: any) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" });

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

  const { data, error, count } = await query
    .range(from, to)
    .order("transaction_time", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data, count };
}

export async function getPaymentHistory(page: number, pageSize: number, filters: any) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("payments")
    .select("*", { count: "exact" });

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
    .order("transaction_time", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data, count };
}
