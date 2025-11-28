"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";

// --- Types ---
export interface Transaction {
  invoice_no: string;
  customer_name: string;
  grand_total: number;
  transaction_time: string;
}

export interface DashboardMetrics {
  totalCustomers: number;
  dailySales: number;
  netProfit: number;
  recentTransactions: Transaction[];
  profitTrend: { date: string; revenue: number; profit: number }[];
  categorySales: { name: string; value: number }[];
  lowStockItems: { id: string; item_name: string; stock: number; threshold?: number }[];
  topProducts: { item_name: string; quantity: number }[];
}

const initialMetrics: DashboardMetrics = {
  totalCustomers: 0,
  dailySales: 0,
  netProfit: 0,
  recentTransactions: [],
  profitTrend: [],
  categorySales: [],
  lowStockItems: [],
  topProducts: [],
};

interface DashboardContextType {
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-rpc-metrics"], // Unique cache key
    enabled: !!session, // Only run if user is logged in
    staleTime: 1000 * 60 * 2, // Data stays "fresh" for 2 mins (no refetch on nav)
    gcTime: 1000 * 60 * 10, // Keep in memory for 10 mins
    refetchOnWindowFocus: false, // Don't refetch just because I clicked the window
    
    queryFn: async () => {
      // 1. Single RPC Call
      const { data, error } = await supabase.rpc("get_dashboard_metrics", {
        lookback_days: 30,
      });

      if (error) throw new Error(error.message);

      return data; // Returns { payments: [], transactions: [], ... }
    },
  });

  // --- Process Data (Memoized) ---
  const metrics = useMemo(() => {
    if (!data) return initialMetrics;

    const { payments, transactions, expenses, inventory } = data;

    // 1. Map Helpers
    const invoiceDateMap = new Map<string, string>();
    payments.forEach((p: any) => {
      if (p.invoice_no && p.transaction_time) invoiceDateMap.set(p.invoice_no, p.transaction_time);
    });

    const today = dayjs();

    // 2. Daily Stats
    const todayPayments = payments.filter((p: any) => dayjs(p.transaction_time).isSame(today, "day"));
    const todaySales = todayPayments.reduce((sum: number, p: any) => sum + (Number(p.grand_total) || 0), 0);

    const todayTransactions = transactions.filter((t: any) => {
      const time = invoiceDateMap.get(t.invoice_no);
      return time && dayjs(time).isSame(today, "day");
    });
    const todayCOGS = todayTransactions.reduce((sum: number, t: any) => sum + ((Number(t.cost_price) || 0) * (Number(t.quantity) || 1)), 0);

    const todayExpenses = expenses
      .filter((e: any) => dayjs(e.transaction_date).isSame(today, "day"))
      .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

    // 3. Trend Data
    const trendMap = new Map<string, { revenue: number; cost: number; expense: number }>();
    for (let i = 29; i >= 0; i--) trendMap.set(dayjs().subtract(i, "day").format("YYYY-MM-DD"), { revenue: 0, cost: 0, expense: 0 });

    payments.forEach((p: any) => {
      const d = dayjs(p.transaction_time).format("YYYY-MM-DD");
      if (trendMap.has(d)) trendMap.get(d)!.revenue += Number(p.grand_total) || 0;
    });
    transactions.forEach((t: any) => {
      const time = invoiceDateMap.get(t.invoice_no);
      if (time) {
        const d = dayjs(time).format("YYYY-MM-DD");
        if (trendMap.has(d)) trendMap.get(d)!.cost += (Number(t.cost_price) || 0) * (Number(t.quantity) || 1);
      }
    });
    expenses.forEach((e: any) => {
      const d = dayjs(e.transaction_date).format("YYYY-MM-DD");
      if (trendMap.has(d)) trendMap.get(d)!.expense += Number(e.amount) || 0;
    });

    const profitTrend = Array.from(trendMap.entries()).map(([date, val]) => ({
      date: dayjs(date).format("MMM D"),
      revenue: Number(val.revenue.toFixed(2)),
      profit: Number((val.revenue - val.cost - val.expense).toFixed(2)),
    }));

    // 4. Categories & Top Products
    const categoryMap = new Map();
    const productMap = new Map();
    transactions.forEach((t: any) => {
      if (invoiceDateMap.has(t.invoice_no)) {
        const cat = t.category || "Uncategorized";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + (Number(t.total_price) || 0));
        productMap.set(t.item_name, (productMap.get(t.item_name) || 0) + (Number(t.quantity) || 0));
      }
    });

    const categorySales = Array.from(categoryMap.entries())
      .map(([name, value]: any) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topProducts = Array.from(productMap.entries())
      .map(([item_name, quantity]: any) => ({ item_name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 5. Low Stock & Recent
    const globalThreshold = typeof window !== "undefined" ? parseInt(localStorage.getItem("pos-settings-low-stock-threshold") || "10", 10) : 10;
    const lowStockItems = inventory
      .filter((i: any) => i.current_stock < (i.low_stock_threshold ?? globalThreshold))
      .map((i: any) => ({
        id: i.item_id,
        item_name: i.item_name,
        stock: i.current_stock,
        threshold: i.low_stock_threshold ?? globalThreshold,
      }))
      .slice(0, 5);

    const recentTransactions = payments
      .sort((a: any, b: any) => dayjs(b.transaction_time).unix() - dayjs(a.transaction_time).unix())
      .slice(0, 5);

    return {
      totalCustomers: new Set(payments.map((c: any) => c.customer_name)).size,
      dailySales: todaySales,
      netProfit: todaySales - todayCOGS - todayExpenses,
      recentTransactions,
      profitTrend,
      categorySales,
      lowStockItems,
      topProducts,
    };
  }, [data]);

  return (
    <DashboardContext.Provider value={{ metrics, isLoading, error: error as Error | null, refetch }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
}