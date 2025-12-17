"use server";

import { createClient } from "@/utils/supabase/server";
import dayjs from "dayjs";

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

// Accept the query context to get the signal
export const fetchDailyCashFlow = async (
  date: string = dayjs().format("YYYY-MM-DD"),
  signal?: AbortSignal 
): Promise<CashFlowEntry[]> => {
  
  // Pass the abortSignal to Supabase
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("categorical_cash_flow")
    .select("*")
    .eq("date", date)
    .abortSignal(signal as AbortSignal); // Supabase supports abortSignal

  if (error) {
    console.error("Error fetching daily cash flow:", error);
    throw new Error(error.message);
  }

  return data || [];
};