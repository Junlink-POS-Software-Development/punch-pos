"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import { DashboardStats } from "@/app/components/DashboardStats";
import { ProfitTrendChart, CategoryDonutChart } from "@/app/components/DashboardCharts";
import { LowStockWidget, TopProductsWidget } from "@/app/components/DashboardWidgets";

interface Transaction {
  invoice_no: string;
  customer_name: string;
  grand_total: number;
  transaction_time: string;
}

interface DashboardMetrics {
  totalCustomers: number;
  dailySales: number;
  netProfit: number;
  recentTransactions: Transaction[];
  profitTrend: { date: string; revenue: number; profit: number }[];
  categorySales: { name: string; value: number }[];
  lowStockItems: { id: string; item_name: string; stock: number }[];
  topProducts: { item_name: string; quantity: number }[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalCustomers: 0,
    dailySales: 0,
    netProfit: 0,
    recentTransactions: [],
    profitTrend: [],
    categorySales: [],
    lowStockItems: [],
    topProducts: [],
  });
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Dashboard data fetch timed out")), 15000);
        });

        // Wrap the actual fetch logic
        const fetchDataPromise = (async () => {
          const [
            { data: paymentsData, error: paymentsError },
            { data: transactionsData, error: transactionsError },
            { data: expensesData, error: expensesError },
            { data: stockData, error: stockError },
          ] = await Promise.all([
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
              .from("stock_flow")
              .select("item_name, flow, quantity"),
          ]);

          if (paymentsError) throw paymentsError;
          if (transactionsError) throw transactionsError;
          if (expensesError) throw expensesError;
          if (stockError) throw stockError;

          return { paymentsData, transactionsData, expensesData, stockData };
        })();

        // Race fetch against timeout
        const result = await Promise.race([fetchDataPromise, timeoutPromise]) as {
            paymentsData: any[];
            transactionsData: any[];
            expensesData: any[];
            stockData: any[];
        };

        const { paymentsData, transactionsData, expensesData, stockData } = result;

        // --- PROCESS DATA ---

        // A. Total Customers (Unique)
        const uniqueCustomers = new Set(
          paymentsData?.map((c) => c.customer_name).filter(Boolean)
        ).size;

        // B. Daily Sales & Net Profit (Today)
        const today = dayjs();
        const todayPayments = paymentsData?.filter(p => 
          p.transaction_time && dayjs(p.transaction_time).isSame(today, 'day')
        ) || [];
        
        const todaySales = todayPayments.reduce((sum, p) => sum + (Number(p.grand_total) || 0), 0);

        // Calculate Today's Cost of Goods Sold (COGS)
        const invoiceDateMap = new Map();
        paymentsData?.forEach(p => {
          if(p.invoice_no) invoiceDateMap.set(p.invoice_no, p.transaction_time);
        });

        const todayTransactions = transactionsData?.filter(t => {
          const time = invoiceDateMap.get(t.invoice_no);
          return time && dayjs(time).isSame(today, 'day');
        }) || [];

        const todayCOGS = todayTransactions.reduce((sum, t) => sum + ((Number(t.cost_price) || 0) * (Number(t.quantity) || 1)), 0);

        // Calculate Today's Expenses
        const todayExpenses = expensesData?.filter(e => 
          dayjs(e.transaction_date).isSame(today, 'day')
        ).reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

        const netProfit = todaySales - todayCOGS - todayExpenses;

        // C. Profit Trend (Last 30 Days)
        // Group sales, cogs, expenses by date
        const trendMap = new Map<string, { revenue: number; cost: number; expense: number }>();
        
        // Init last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
          trendMap.set(date, { revenue: 0, cost: 0, expense: 0 });
        }

        paymentsData?.forEach(p => {
          if (!p.transaction_time) return;
          const date = dayjs(p.transaction_time).format('YYYY-MM-DD');
          if (trendMap.has(date)) {
            const curr = trendMap.get(date)!;
            curr.revenue += Number(p.grand_total) || 0;
          }
        });

        // For COGS, we iterate transactions and find date via invoice
        transactionsData?.forEach(t => {
          const time = invoiceDateMap.get(t.invoice_no);
          if (!time) return;
          const date = dayjs(time).format('YYYY-MM-DD');
          if (trendMap.has(date)) {
            const curr = trendMap.get(date)!;
            curr.cost += (Number(t.cost_price) || 0) * (Number(t.quantity) || 1);
          }
        });

        expensesData?.forEach(e => {
          const date = dayjs(e.transaction_date).format('YYYY-MM-DD');
          if (trendMap.has(date)) {
            const curr = trendMap.get(date)!;
            curr.expense += Number(e.amount) || 0;
          }
        });

        const profitTrend = Array.from(trendMap.entries()).map(([date, val]) => ({
          date: dayjs(date).format('MMM D'),
          revenue: val.revenue,
          profit: val.revenue - val.cost - val.expense
        }));

        // D. Category Sales
        const categoryMap = new Map<string, number>();
        transactionsData?.forEach(t => {
          const cat = t.category || "Uncategorized";
          const val = Number(t.total_price) || 0;
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + val);
        });

        const categorySales = Array.from(categoryMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // E. Top Products
        const productMap = new Map<string, number>();
        transactionsData?.forEach(t => {
          const name = t.item_name;
          const qty = Number(t.quantity) || 0;
          productMap.set(name, (productMap.get(name) || 0) + qty);
        });

        const topProducts = Array.from(productMap.entries())
          .map(([item_name, quantity]) => ({ item_name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        // F. Low Stock
        // Calculate stock from flows
        const stockMap = new Map<string, number>();
        stockData?.forEach(s => {
          const qty = Number(s.quantity) || 0;
          const current = stockMap.get(s.item_name) || 0;
          if (s.flow === 'IN') {
            stockMap.set(s.item_name, current + qty);
          } else {
            stockMap.set(s.item_name, current - qty);
          }
        });

        const lowStockItems = Array.from(stockMap.entries())
          .map(([item_name, stock]) => ({ id: item_name, item_name, stock })) // using name as id if id not avail
          .filter(i => i.stock < 10)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5); // Show top 5 low stock

        // G. Recent Transactions
        const recentTransactions = paymentsData
          ?.sort((a, b) => dayjs(b.transaction_time).unix() - dayjs(a.transaction_time).unix())
          .slice(0, 5) || [];

        setMetrics({
          totalCustomers: uniqueCustomers,
          dailySales: todaySales,
          netProfit: netProfit,
          recentTransactions,
          profitTrend,
          categorySales,
          lowStockItems,
          topProducts,
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-4 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <h1 className="mb-4 font-bold text-2xl">Dashboard</h1>
      <div className="mb-8 border border-slate-700"></div>

      {/* 1. STATS CARDS */}
      <DashboardStats 
        metrics={{
          totalCustomers: metrics.totalCustomers,
          dailySales: metrics.dailySales,
          netProfit: metrics.netProfit
        }} 
        loading={loading} 
      />

      {/* 2. CHARTS */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mt-6 mb-6">
        {/* Profit Trend */}
        <div className="lg:col-span-2 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
          <h3 className="mb-4 font-semibold text-lg">Profit Trend (30 Days)</h3>
          <ProfitTrendChart data={metrics.profitTrend} />
        </div>

        {/* Category Sales */}
        <div className="lg:col-span-1 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
          <h3 className="mb-4 font-semibold text-lg text-center">
            Sales by Category
          </h3>
          <CategoryDonutChart data={metrics.categorySales} />
        </div>
      </div>

      {/* 3. WIDGETS & DATA TABLE */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mb-6">
        {/* Low Stock */}
        <div className="lg:col-span-1">
          <LowStockWidget items={metrics.lowStockItems} />
        </div>

        {/* Top Products */}
        <div className="lg:col-span-1">
          <TopProductsWidget products={metrics.topProducts} />
        </div>

        {/* Recent Transactions Table */}
        <div className="lg:col-span-1 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
          <h3 className="mb-4 font-semibold text-lg">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-slate-700 border-b text-slate-400">
                  <th className="py-2">Invoice</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {metrics.recentTransactions.length > 0 ? (
                  metrics.recentTransactions.map((t) => (
                    <tr key={t.invoice_no}>
                      <td className="py-3 text-xs">{t.invoice_no}</td>
                      <td className="py-3 text-xs truncate max-w-[100px]">{t.customer_name || "N/A"}</td>
                      <td className="py-3 text-right text-xs">
                        ${Number(t.grand_total).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500">
                      No recent transactions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
