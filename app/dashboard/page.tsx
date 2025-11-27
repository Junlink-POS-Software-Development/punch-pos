"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DashboardStats } from "@/app/components/DashboardStats";
import { ProfitTrendChart, CategoryDonutChart } from "@/app/components/DashboardCharts";
import { LowStockWidget, TopProductsWidget } from "@/app/components/DashboardWidgets";
import { useDashboardData } from "./hooks/useDashboardData";
import { RecentTransactionsWidget } from "./components/RecentTransactionsWidget";


export default function DashboardPage() {
  // Logic is now one line
  const { metrics, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 min-h-screen text-white">
        <div className="flex items-center gap-2 text-red-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Failed to load dashboard</span>
        </div>
        <p className="text-slate-400 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Retry
        </button>
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
        <div className="lg:col-span-2 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
          <h3 className="mb-4 font-semibold text-lg">Profit Trend (30 Days)</h3>
          <ProfitTrendChart data={metrics.profitTrend} />
        </div>

        <div className="lg:col-span-1 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
          <h3 className="mb-4 font-semibold text-lg text-center">
            Sales by Category
          </h3>
          <CategoryDonutChart data={metrics.categorySales} />
        </div>
      </div>

      {/* 3. WIDGETS */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-1">
          <LowStockWidget items={metrics.lowStockItems} />
        </div>

        <div className="lg:col-span-1">
          <TopProductsWidget products={metrics.topProducts} />
        </div>

        {/* Refactored Component */}
        <RecentTransactionsWidget transactions={metrics.recentTransactions} />
      </div>
    </div>
  );
}