// hooks/useDashboardData.ts
import { useState, useEffect, useCallback, useRef } from "react";
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

// --- Hook ---

export function useDashboardData() {
  const { isAuthReady } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);

  // Ref to track if component is mounted (prevents memory leaks/state updates on unmount)
  const isMounted = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    // If auth isn't ready, we wait. The useEffect below handles the timeout safety.
    if (!isAuthReady) return;

    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      // 1. Verify Session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User session not found. Please log in.");

      // 2. Fetch Data (Parallel)
      // We use a 30s timeout for the fetch itself
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out after 30s.")), 30000);
      });

      const fetchDataPromise = (async () => {
        const [payments, transactions, expenses, inventory] = await Promise.all([
          supabase
            .from("payments")
            .select("invoice_no, customer_name, grand_total, transaction_time"),
          supabase
            .from("transactions")
            .select("item_name, total_price, cost_price, quantity, category, invoice_no"),
          supabase
            .from("expenses")
            .select("amount, transaction_date"),
          supabase
            .from("inventory_monitor_view")
            .select("item_id, item_name, current_stock, low_stock_threshold")
            .order("current_stock", { ascending: true })
        ]);

        if (payments.error) throw new Error(`Payments: ${payments.error.message}`);
        if (transactions.error) throw new Error(`Transactions: ${transactions.error.message}`);
        if (expenses.error) throw new Error(`Expenses: ${expenses.error.message}`);
        if (inventory.error) throw new Error(`Inventory: ${inventory.error.message}`);

        return {
          paymentsData: payments.data || [],
          transactionsData: transactions.data || [],
          expensesData: expenses.data || [],
          inventoryData: inventory.data || []
        };
      })();

      // Race fetch against timeout
      const { paymentsData, transactionsData, expensesData, inventoryData } = 
        await Promise.race([fetchDataPromise, timeoutPromise]) as any;

      if (!isMounted.current) return;

      // --- DATA PROCESSING ---

      // Helper: Map Invoice Numbers to Dates
      // (Required because 'transactions' table often lacks the timestamp)
      const invoiceDateMap = new Map<string, string>();
      paymentsData.forEach((p: any) => {
        if (p.invoice_no && p.transaction_time) {
          invoiceDateMap.set(p.invoice_no, p.transaction_time);
        }
      });

      // A. Total Customers
      const uniqueCustomers = new Set(
        paymentsData.map((c: any) => c.customer_name).filter(Boolean)
      ).size;

      // B. Daily Stats (Today)
      const today = dayjs();
      
      // B1. Today's Revenue
      const todayPayments = paymentsData.filter((p: any) => 
        p.transaction_time && dayjs(p.transaction_time).isSame(today, 'day')
      );
      const todaySales = todayPayments.reduce((sum: number, p: any) => sum + (Number(p.grand_total) || 0), 0);

      // B2. Today's COGS (Cost of Goods Sold)
      const todayTransactions = transactionsData.filter((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        return time && dayjs(time).isSame(today, 'day');
      });
      const todayCOGS = todayTransactions.reduce((sum: number, t: any) => 
        sum + ((Number(t.cost_price) || 0) * (Number(t.quantity) || 1)), 0
      );

      // B3. Today's Expenses
      const todayExpenses = expensesData.filter((e: any) => 
        dayjs(e.transaction_date).isSame(today, 'day')
      ).reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

      const netProfit = todaySales - todayCOGS - todayExpenses;

      // C. Profit Trend (Last 30 Days)
      const trendMap = new Map<string, { revenue: number; cost: number; expense: number }>();
      
      // Initialize map with 0s for last 30 days
      for (let i = 29; i >= 0; i--) {
        const dateKey = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
        trendMap.set(dateKey, { revenue: 0, cost: 0, expense: 0 });
      }

      // C1. Fill Revenue
      paymentsData.forEach((p: any) => {
        if (!p.transaction_time) return;
        const dateKey = dayjs(p.transaction_time).format('YYYY-MM-DD');
        if (trendMap.has(dateKey)) {
          trendMap.get(dateKey)!.revenue += Number(p.grand_total) || 0;
        }
      });

      // C2. Fill Costs (using invoiceDateMap)
      transactionsData.forEach((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        if (time) {
          const dateKey = dayjs(time).format('YYYY-MM-DD');
          if (trendMap.has(dateKey)) {
            const cost = (Number(t.cost_price) || 0) * (Number(t.quantity) || 1);
            trendMap.get(dateKey)!.cost += cost;
          }
        }
      });

      // C3. Fill Expenses
      expensesData.forEach((e: any) => {
        if (!e.transaction_date) return;
        const dateKey = dayjs(e.transaction_date).format('YYYY-MM-DD');
        if (trendMap.has(dateKey)) {
          trendMap.get(dateKey)!.expense += Number(e.amount) || 0;
        }
      });

      const profitTrend = Array.from(trendMap.entries()).map(([date, val]) => ({
        date: dayjs(date).format('MMM D'),
        revenue: Number(val.revenue.toFixed(2)),
        profit: Number((val.revenue - val.cost - val.expense).toFixed(2))
      }));

      // D. Category Sales
      const categoryMap = new Map<string, number>();
      transactionsData.forEach((t: any) => {
        const cat = t.category || "Uncategorized";
        const val = Number(t.total_price) || 0;
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + val);
      });
      const categorySales = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // E. Top Products
      const productMap = new Map<string, number>();
      transactionsData.forEach((t: any) => {
        const name = t.item_name;
        const qty = Number(t.quantity) || 0;
        productMap.set(name, (productMap.get(name) || 0) + qty);
      });
      const topProducts = Array.from(productMap.entries())
        .map(([item_name, quantity]) => ({ item_name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // F. Low Stock
      // Try to get setting, default to 10
      const globalThreshold = typeof window !== 'undefined' 
        ? parseInt(localStorage.getItem('pos-settings-low-stock-threshold') || '10', 10)
        : 10;
        
      const lowStockItems = inventoryData
        .filter((item: any) => {
          const threshold = item.low_stock_threshold ?? globalThreshold;
          return item.current_stock >= 0 && item.current_stock < threshold;
        })
        .map((item: any) => ({
          id: item.item_id,
          item_name: item.item_name,
          stock: item.current_stock,
          threshold: item.low_stock_threshold ?? globalThreshold
        }))
        .slice(0, 5);

      // G. Recent Transactions
      const recentTransactions = paymentsData
        .sort((a: any, b: any) => dayjs(b.transaction_time).unix() - dayjs(a.transaction_time).unix())
        .slice(0, 5);

      setMetrics({
        totalCustomers: uniqueCustomers,
        dailySales: todaySales,
        netProfit,
        recentTransactions,
        profitTrend,
        categorySales,
        lowStockItems,
        topProducts,
      });

    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      if (isMounted.current) {
        setError(err.message || "Failed to load dashboard data");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isAuthReady]);

  // --- Effects ---

  useEffect(() => {
    isMounted.current = true;
    let authTimeout: NodeJS.Timeout;

    if (!isAuthReady) {
      // 1. SAFETY VALVE: If Auth takes > 5 seconds, kill the loader
      authTimeout = setTimeout(() => {
        if (isMounted.current && loading) {
          console.warn("Auth initialization timed out in Dashboard.");
          setLoading(false);
          setError("Connection slow. Please refresh.");
        }
      }, 5000);
    } else {
      // 2. Auth is ready, fetch data
      fetchDashboardData();
    }

    return () => {
      isMounted.current = false;
      clearTimeout(authTimeout);
    };
  }, [isAuthReady, fetchDashboardData]);

  return { metrics, loading, error, refetch: fetchDashboardData };
}