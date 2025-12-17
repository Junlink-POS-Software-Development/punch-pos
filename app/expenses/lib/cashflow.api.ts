"use server";

import { createClient } from "@/utils/supabase/server";

const getSupabase = async () => {
  return await createClient();
};

export interface CashFlowEntry {
  store_id: string;
  category: string;
  date: string;
  forwarded: number;
  cash_in: number;
  cash_out: number;
  balance: number;
}

export interface DateRange {
  start: string;
  end: string;
}

// 1. Fetch Categories for the Dropdown
export const fetchFlowCategories = async (): Promise<string[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("product_category")
    .select("category")
    .order("category");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data?.map((d) => d.category) || [];
};

// 2. Fetch Ledger Data with Filters
export const fetchCashFlowLedger = async (
  category: string,
  range: DateRange
): Promise<CashFlowEntry[]> => {
  if (!category) return [];

  const supabase = await getSupabase();
  let query = supabase
    .from("categorical_cash_flow")
    .select("*")
    .eq("category", category)
    .gte("date", range.start)
    .lte("date", range.end)
    .order("date", { ascending: true }); // <--- CHANGED TO TRUE (Oldest First)

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching ledger:", error);
    throw new Error(error.message);
  }

  return data || [];
};