import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import dayjs from 'dayjs';

// --- Types ---
export interface Transaction {
  invoice_no: string;
  customer_name: string;
  grand_total: number;
  transaction_time: string;
  // Add other fields if needed for processing
  [key: string]: any;
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

interface DashboardState {
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: Error | null;
  lastFetched: number | null;
  fetchMetrics: (force?: boolean) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: initialMetrics,
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchMetrics: async (force = false) => {
    const { lastFetched, isLoading } = get();
    const now = Date.now();
    const STALE_TIME = 1000 * 60 * 2; // 2 minutes

    // Prevent fetching if already loading or data is fresh (unless forced)
    if (isLoading) return;
    if (!force && lastFetched && now - lastFetched < STALE_TIME) return;

    set({ isLoading: true, error: null });

    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        lookback_days: 30,
      });

      if (error) throw new Error(error.message);

      // --- Process Data ---
      const { payments, transactions, expenses, inventory } = data;

      // 1. Map Helpers
      const invoiceDateMap = new Map<string, string>();
      payments.forEach((p: any) => {
        if (p.invoice_no && p.transaction_time) invoiceDateMap.set(p.invoice_no, p.transaction_time);
      });

      const today = dayjs();

      // 2. Daily Stats
      const todayPayments = payments.filter((p: any) => dayjs(p.transaction_time).isSame(today, 'day'));
      const todaySales = todayPayments.reduce((sum: number, p: any) => sum + (Number(p.grand_total) || 0), 0);

      const todayTransactions = transactions.filter((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        return time && dayjs(time).isSame(today, 'day');
      });
      const todayCOGS = todayTransactions.reduce(
        (sum: number, t: any) => sum + (Number(t.cost_price) || 0) * (Number(t.quantity) || 1),
        0
      );

      const todayExpenses = expenses
        .filter((e: any) => dayjs(e.transaction_date).isSame(today, 'day'))
        .reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

      // 3. Trend Data
      const trendMap = new Map<string, { revenue: number; cost: number; expense: number }>();
      for (let i = 29; i >= 0; i--)
        trendMap.set(dayjs().subtract(i, 'day').format('YYYY-MM-DD'), { revenue: 0, cost: 0, expense: 0 });

      payments.forEach((p: any) => {
        const d = dayjs(p.transaction_time).format('YYYY-MM-DD');
        if (trendMap.has(d)) trendMap.get(d)!.revenue += Number(p.grand_total) || 0;
      });
      transactions.forEach((t: any) => {
        const time = invoiceDateMap.get(t.invoice_no);
        if (time) {
          const d = dayjs(time).format('YYYY-MM-DD');
          if (trendMap.has(d)) trendMap.get(d)!.cost += (Number(t.cost_price) || 0) * (Number(t.quantity) || 1);
        }
      });
      expenses.forEach((e: any) => {
        const d = dayjs(e.transaction_date).format('YYYY-MM-DD');
        if (trendMap.has(d)) trendMap.get(d)!.expense += Number(e.amount) || 0;
      });

      const profitTrend = Array.from(trendMap.entries()).map(([date, val]) => ({
        date: dayjs(date).format('MMM D'),
        revenue: Number(val.revenue.toFixed(2)),
        profit: Number((val.revenue - val.cost - val.expense).toFixed(2)),
      }));

      // 4. Categories & Top Products
      const categoryMap = new Map();
      const productMap = new Map();
      transactions.forEach((t: any) => {
        if (invoiceDateMap.has(t.invoice_no)) {
          const cat = t.category || 'Uncategorized';
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
      const globalThreshold =
        typeof window !== 'undefined' ? parseInt(localStorage.getItem('pos-settings-low-stock-threshold') || '10', 10) : 10;
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

      const metrics = {
        totalCustomers: new Set(payments.map((c: any) => c.customer_name)).size,
        dailySales: todaySales,
        netProfit: todaySales - todayCOGS - todayExpenses,
        recentTransactions,
        profitTrend,
        categorySales,
        lowStockItems,
        topProducts,
      };

      set({ metrics, isLoading: false, lastFetched: now });
    } catch (error: any) {
      set({ error, isLoading: false });
    }
  },
}));
