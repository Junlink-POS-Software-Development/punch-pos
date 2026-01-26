"use server";

import { createClient } from "@/utils/supabase/server";
import dayjs from "dayjs";
import { CashFlowEntry, FinancialReportItem } from "./types";

const getSupabase = async () => {
  return await createClient();
};


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

export const fetchQuantitySoldByCategory = async (
  date: string = dayjs().format("YYYY-MM-DD")
): Promise<{ category: string; quantity: number }[]> => {
  const supabase = await getSupabase();
  
  // We need to join transactions with product_category to get the category name
  // and sum the quantity for the given date.
  const { data, error } = await supabase
    .from("transactions")
    .select(`
      quantity,
      product_category!inner (
        category
      )
    `)
    .gte("transaction_time", `${date} 00:00:00`)
    .lte("transaction_time", `${date} 23:59:59`);

  if (error) {
    console.error("Error fetching quantity sold by category:", error);
    throw new Error(error.message);
  }

  // Process the data to group by category and sum quantity
  const groupedData: Record<string, number> = {};

  data.forEach((item: any) => {
    const categoryName = item.product_category?.category || "Uncategorized";
    const qty = Number(item.quantity) || 0;
    if (groupedData[categoryName]) {
      groupedData[categoryName] += qty;
    } else {
      groupedData[categoryName] = qty;
    }
  });

  return Object.entries(groupedData).map(([category, quantity]) => ({
    category,
    quantity,
  }));
};