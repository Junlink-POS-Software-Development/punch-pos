"use client";

import React, { useState } from "react";
import { LayoutDashboard, FileText, Loader2, ArrowLeft } from "lucide-react";
import { FinancialReportContainer } from "./components/financial-report/FinancialReportContainer";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics";
import { DashboardGrid } from "./components/DashboardGrid";
import Link from "next/link";


const DEFAULT_ITEMS = [
  "cash-on-hand", 
  "daily-gross", 
  "daily-expenses", 
  "monthly-gross"
];

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'report'>('grid');


  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);

  
const { data: metrics, isLoading, error } = useDashboardMetrics();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header & View Switcher */}
      <div className="flex justify-between items-center">
        <div className="">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-2 pt-2 pl-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Overview of your store performance</p>
        </div>
        </div>

        <div className="bg-slate-800 p-1 rounded-lg flex items-center border border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'grid' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setViewMode('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'report' 
                ? 'bg-emerald-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Financial Report
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {viewMode === 'grid' ? (
          // GRID VIEW
          isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-400 p-10">
              Error loading dashboard metrics.
            </div>
          ) : (
            /* --- FIX: Pass the required props here --- */
            <DashboardGrid 
              metrics={metrics} 
              items={items} 
              onOrderChange={setItems} 
            />
          )
        ) : (
          // REPORT VIEW
          <FinancialReportContainer />
        )}
        
      </div>

    </div>
  );
}