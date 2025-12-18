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

export const fetchDailyCashFlow = async (
  date: string = dayjs().format("YYYY-MM-DD"),
  signal?: AbortSignal 
): Promise<CashFlowEntry[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("categorical_cash_flow")
    .select("*")
    .eq("date", date)
    .abortSignal(signal as AbortSignal);

  if (error) {
    console.error("Error fetching daily cash flow:", error);
    throw new Error(error.message);
  }

  return data || [];
};

// OPTIMIZED: Uses Database RPC to return a single number
export const fetchCashFlowByRange = async (
  startDate: string,
  endDate: string
): Promise<number> => {
  const supabase = await getSupabase();
  
  const { data, error } = await supabase
    .rpc('get_range_gross', { 
      start_date: startDate, 
      end_date: endDate 
    });

  if (error) {
    console.error("Error fetching cash flow range:", error);
    throw new Error(error.message);
  }

  return data || 0;
};


export interface FinancialReportItem {
  category: string;
  cash_forwarded: number;
  gross_income: number;
  expenses: number;
  cash_on_hand: number;
}

export const fetchFinancialReport = async (
  startDate: string,
  endDate: string
): Promise<FinancialReportItem[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc('get_financial_report', {
    start_date: startDate,
    end_date: endDate
  });

  if (error) {
    console.error("Error fetching financial report:", error);
    throw new Error(error.message);
  }

  return data || [];
};