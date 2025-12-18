"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics";
import CashOnHandCard from "./components/CashOnHandCard";
import DailyExpensesCard from "./components/DailyExpensesCard"; // Renamed import
import DailyGrossIncomeCard from "./components/DailyGrossIncomeCard"; // New import
import MonthlyGrossCard from "./components/MonthlyGrossCard";

export default function DashboardPage() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
      
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Dashboard</h1>
        <p className="text-slate-400">Overview of today's performance</p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-8">
          Error: {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Cash on Hand (Net Sales) */}
          <CashOnHandCard 
            totalNetSales={metrics.totalNetSales} 
            cashFlow={metrics.cashFlow} 
          />

          {/* Card 2: Daily Gross Income (New) */}
          <DailyGrossIncomeCard 
            cashFlow={metrics.cashFlow} 
          />
          
          {/* Card 3: Daily Expenses (Renamed) */}
          <DailyExpensesCard 
            totalExpenses={metrics.totalExpenses} 
            cashFlow={metrics.cashFlow} 
          />
          
          {/* Card 4: Monthly Gross (Date Range Picker) */}
          <MonthlyGrossCard />
        </div>
      )}
    </div>
  );
}