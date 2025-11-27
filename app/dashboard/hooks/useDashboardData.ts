import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import { useAuth } from "@/context/AuthContext";

// --- Types (Same as before) ---
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

export function useDashboardData() {
  const { isAuthReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);

  // Ref to track mount state
  const isMounted = useRef(true);
  // Ref to track the current abort controller so we can cancel previous clicks
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDashboardData = useCallback(async () => {
    // 1. Cancel any pending request from previous attempts
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create new controller for this run
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isAuthReady) return;

    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      console.log("DASHBOARD: Starting fetch sequence...");

      // 2. The "Hard" Timeout Wrapper
      // This promise rejects if ANYTHING takes longer than 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        const id = setTimeout(() => reject(new Error("TIMEOUT_HARD")), 15000);
        // If the operation finishes or is aborted, clear the timer
        controller.signal.addEventListener('abort', () => clearTimeout(id));
      });

      // 3. The Main Logic Wrapper
      const operationPromise = async () => {
        // STAGE A: Auth Check
        console.log("DASHBOARD: Checking Auth...");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) throw new Error("Authentication failed or session expired.");
        if (controller.signal.aborted) throw new Error("ABORTED");

        // STAGE B: Database Fetches
        // We pass { abortSignal: controller.signal } to Supabase to kill connection if needed
        console.log("DASHBOARD: Fetching DB data...");
        
        const [payments, transactions, expenses, inventory] = await Promise.all([
          supabase.from("payments").select("invoice_no, customer_name, grand_total, transaction_time").abortSignal(controller.signal),
          supabase.from("transactions").select("item_name, total_price, cost_price, quantity, category, invoice_no").abortSignal(controller.signal),
          supabase.from("expenses").select("amount, transaction_date").abortSignal(controller.signal),
          supabase.from("inventory_monitor_view").select("item_id, item_name, current_stock, low_stock_threshold").order("current_stock", { ascending: true }).abortSignal(controller.signal)
        ]);

        if (controller.signal.aborted) throw new Error("ABORTED");

        // Check for specific DB errors
        if (payments.error) throw new Error(`Payments DB Error: ${payments.error.message}`);
        if (transactions.error) throw new Error(`Transactions DB Error: ${transactions.error.message}`);
        
        return {
          paymentsData: payments.data || [],
          transactionsData: transactions.data || [],
          expensesData: expenses.data || [],
          inventoryData: inventory.data || []
        };
      };

      // 4. RACE: Run Logic vs Timeout
      const result = await Promise.race([operationPromise(), timeoutPromise]) as any;

      if (!isMounted.current) return;
      console.log("DASHBOARD: Data received. Processing...");

      // --- DATA PROCESSING (Calculations) ---
      
      const { paymentsData, transactionsData, expensesData, inventoryData } = result;

      // Map Dates
      const invoiceDateMap = new Map<string, string>();
      paymentsData.forEach((p: any) => {
        if (p.invoice_no && p.transaction_time) invoiceDateMap.set(p.invoice_no, p.transaction_time);
      });

      // Calcs...
      const uniqueCustomers = new Set(paymentsData.map((c: any) => c.customer_name).filter(Boolean)).size;
      const today = dayjs();
      
      // Today Sales
      const todayPayments = paymentsData.filter((p: any) => p.transaction_time && dayjs(p.transaction_time).isSame(today, 'day'));
      const todaySales = todayPayments.reduce((sum: number, p: any) => sum + (Number(p.grand_total) || 0), 0);

      // Today COGS
      const todayTransactions = transactionsData.filter((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        return time && dayjs(time).isSame(today, 'day');
      });
      const todayCOGS = todayTransactions.reduce((sum: number, t: any) => sum + ((Number(t.cost_price) || 0) * (Number(t.quantity) || 1)), 0);

      // Today Expenses
      const todayExpenses = expensesData.filter((e: any) => dayjs(e.transaction_date).isSame(today, 'day'))
        .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
      
      // Profit Trend
      const trendMap = new Map<string, { revenue: number; cost: number; expense: number }>();
      for (let i = 29; i >= 0; i--) {
        trendMap.set(dayjs().subtract(i, 'day').format('YYYY-MM-DD'), { revenue: 0, cost: 0, expense: 0 });
      }

      paymentsData.forEach((p: any) => {
        if (!p.transaction_time) return;
        const d = dayjs(p.transaction_time).format('YYYY-MM-DD');
        if (trendMap.has(d)) trendMap.get(d)!.revenue += Number(p.grand_total) || 0;
      });
      
      transactionsData.forEach((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        if (time) {
          const d = dayjs(time).format('YYYY-MM-DD');
          if (trendMap.has(d)) trendMap.get(d)!.cost += (Number(t.cost_price) || 0) * (Number(t.quantity) || 1);
        }
      });

      expensesData.forEach((e: any) => {
        if (!e.transaction_date) return;
        const d = dayjs(e.transaction_date).format('YYYY-MM-DD');
        if (trendMap.has(d)) trendMap.get(d)!.expense += Number(e.amount) || 0;
      });

      const profitTrend = Array.from(trendMap.entries()).map(([date, val]) => ({
        date: dayjs(date).format('MMM D'),
        revenue: Number(val.revenue.toFixed(2)),
        profit: Number((val.revenue - val.cost - val.expense).toFixed(2))
      }));

      // Top Products & Categories
      const categoryMap = new Map<string, number>();
      const productMap = new Map<string, number>();
      
      transactionsData.forEach((t: any) => {
        const cat = t.category || "Uncategorized";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + (Number(t.total_price) || 0));
        productMap.set(t.item_name, (productMap.get(t.item_name) || 0) + (Number(t.quantity) || 0));
      });

      const categorySales = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      const topProducts = Array.from(productMap.entries()).map(([item_name, quantity]) => ({ item_name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

      // Low Stock
      const globalThreshold = typeof window !== 'undefined' ? parseInt(localStorage.getItem('pos-settings-low-stock-threshold') || '10', 10) : 10;
      const lowStockItems = inventoryData.filter((i: any) => i.current_stock < (i.low_stock_threshold ?? globalThreshold))
        .map((i: any) => ({
            id: i.item_id, item_name: i.item_name, stock: i.current_stock, threshold: i.low_stock_threshold ?? globalThreshold
        })).slice(0, 5);
      
      const recentTransactions = paymentsData.sort((a: any, b: any) => dayjs(b.transaction_time).unix() - dayjs(a.transaction_time).unix()).slice(0, 5);

      setMetrics({
        totalCustomers: uniqueCustomers,
        dailySales: todaySales,
        netProfit: todaySales - todayCOGS - todayExpenses,
        recentTransactions,
        profitTrend,
        categorySales,
        lowStockItems,
        topProducts
      });

      console.log("DASHBOARD: Success.");

    } catch (err: any) {
      if (err.message === "ABORTED") {
        console.log("DASHBOARD: Fetch aborted (likely navigation).");
        return;
      }
      
      console.error("DASHBOARD ERROR:", err);
      
      if (isMounted.current) {
        if (err.message === "TIMEOUT_HARD") {
          setError("Connection timed out. Please check your internet.");
        } else {
          setError(err.message || "Failed to load dashboard.");
        }
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [isAuthReady]);

  // --- Strict Mode Safety Effect ---
  useEffect(() => {
    isMounted.current = true;

    // If Auth is taking forever (>5s) to even initialize, show error
    let authWatchdog: NodeJS.Timeout;
    
    if (!isAuthReady) {
      authWatchdog = setTimeout(() => {
        if (isMounted.current && loading) {
          console.warn("DASHBOARD: Auth watchdog triggered.");
          setLoading(false);
          setError("Authentication stuck. Please refresh.");
        }
      }, 5000);
    } else {
      // Auth is ready, start the fetch
      fetchDashboardData();
    }

    return () => {
      isMounted.current = false;
      clearTimeout(authWatchdog);
      // CLEANUP: Abort any running requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isAuthReady, fetchDashboardData]);

  return { metrics, loading, error, refetch: fetchDashboardData };
}