"use server";

import { createClient } from "@/utils/supabase/server";
import dayjs from "dayjs";
import { CashFlowEntry, FinancialReportItem } from "./types";

const getSupabase = async () => {
  return await createClient();
};

const getStoreId = async () => {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile, error } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (error || !profile?.store_id) {
    console.error("Error fetching user store_id:", error);
    throw new Error("Store ID not found");
  }

  return profile.store_id;
};


export const fetchDailyCashFlow = async (
  date: string = dayjs().format("YYYY-MM-DD"),
  signal?: AbortSignal 
): Promise<CashFlowEntry[]> => {
  const supabase = await getSupabase();
  const storeId = await getStoreId();
  const { data, error } = await supabase
    .from("categorical_cash_flow")
    .select("*")
    .eq("date", date)
    .eq("store_id", storeId)
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
  const storeId = await getStoreId();
  
  const { data, error } = await supabase
    .rpc('get_range_gross', { 
      start_date: startDate, 
      end_date: endDate,
      p_store_id: storeId
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
  const storeId = await getStoreId();
  
  // Sum up stats from daily_store_stats for the range
  const { data, error } = await supabase
    .from("daily_store_stats")
    .select("total_gross_sales, total_cashout, cash_remaining")
    .eq("store_id", storeId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    console.error("Error fetching financial report:", error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) return [];

  const totals = data.reduce(
    (acc, curr) => ({
      gross: acc.gross + (Number(curr.total_gross_sales) || 0),
      expenses: acc.expenses + (Number(curr.total_cashout) || 0),
      // For cash on hand, we take the last day's cash_remaining in the range
      // but for a summary, maybe we just want to show the current state or sum?
      // Usually "Cash on Hand" in a period report is the ending balance.
      // However, the original report might have been per category.
      // Since daily_store_stats is overall, we return one "Overall" row.
    }),
    { gross: 0, expenses: 0 }
  );

  // We need to handle cash_forwarded. It's the balance before the startDate.
  const { data: previousData } = await supabase
    .from("overall_cash_flow")
    .select("balance")
    .eq("store_id", storeId)
    .lt("date", startDate)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cashForwarded = previousData?.balance || 0;

  // Get the latest balance within the range for cash_on_hand
  const { data: latestData } = await supabase
    .from("overall_cash_flow")
    .select("balance")
    .eq("store_id", storeId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cashOnHand = latestData?.balance || cashForwarded;

  return [
    {
      category: "Overall Store Performance",
      cash_forwarded: Number(cashForwarded),
      gross_income: totals.gross,
      expenses: totals.expenses,
      cash_on_hand: Number(cashOnHand),
    },
  ];
};

export const fetchDashboardStats = async (
  date: string
): Promise<any> => {
  const supabase = await getSupabase();
  const storeId = await getStoreId();
  
  // 1. Fetch pre-calculated stats from daily_store_stats
  const { data: statsData, error: statsError } = await supabase
    .from("daily_store_stats")
    .select("*")
    .eq("date", date)
    .eq("store_id", storeId)
    .maybeSingle();

  if (statsError) {
    console.error("Error fetching dashboard stats:", statsError);
    throw new Error(statsError.message);
  }

  // 2. Fetch live cash in drawer balance from overall_cash_flow
  const { data: cashData, error: cashError } = await supabase
    .from("overall_cash_flow")
    .select("balance")
    .eq("store_id", storeId)
    .lte("date", date)
    .order("date", { ascending: false }) // Get the latest balance up to the selected date
    .limit(1)
    .maybeSingle();

  if (cashError) {
    console.error("Error fetching live cash in drawer:", cashError);
  }

  if (!statsData && !cashData) {
    return null;
  }

  // Use the live balance if available, otherwise fallback to stats table
  const cashInDrawer = cashData ? Number(cashData.balance) : (statsData ? Number(statsData.cash_remaining) : 0);

  return {
    grossSales: Number(statsData?.total_gross_sales || 0),
    salesDiscount: 0, 
    salesReturn: 0,
    salesAllowance: 0,
    netSales: Number(statsData?.total_net_sales || 0),
    cashInDrawer: cashInDrawer,
    cashout: {
      total: Number(statsData?.total_cashout || 0),
      cogs: Number(statsData?.total_cogs || 0),
      opex: Number(statsData?.total_opex || 0),
      remittance: Number(statsData?.total_remittance || 0),
    },
    netProfit: Number(statsData?.net_profit || 0),
  };
};

export const fetchQuantitySoldByCategory = async (
  date: string = dayjs().format("YYYY-MM-DD")
): Promise<{ category: string; quantity: number }[]> => {
  const supabase = await getSupabase();
  const storeId = await getStoreId();
  
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
    .eq("store_id", storeId)
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