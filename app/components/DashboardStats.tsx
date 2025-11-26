"use client";

import { TrendingDown, Brain, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency } from "@/lib/utils/currency";

interface DashboardStatsProps {
  metrics: {
    totalCustomers: number;
    dailySales: number;
    netProfit: number;
  };
  loading: boolean;
}

export function DashboardStats({ metrics, loading }: DashboardStatsProps) {
  const { currency } = useSettings();

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
      {/* Total Customers */}
      <div className="bg-slate-900/50 hover:bg-slate-900/80 p-6 border border-slate-800 rounded-2xl transition-colors glass-effect">
        <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
          Total Customers
        </h3>
        {loading ? (
          <Loader2 className="mt-2 w-6 h-6 animate-spin text-slate-500" />
        ) : (
          <p className="mt-2 font-bold text-white text-3xl tracking-tight">
            {metrics.totalCustomers.toLocaleString()}
          </p>
        )}
        <p className="flex items-center gap-1 mt-2 text-green-400 text-xs">
          <TrendingDown className="w-3 h-3 rotate-180" />
          Unique
        </p>
      </div>

      {/* Daily Sales */}
      <div className="bg-slate-900/50 hover:bg-slate-900/80 p-6 border border-slate-800 rounded-2xl transition-colors glass-effect">
        <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
          Daily Sales
        </h3>
        {loading ? (
          <Loader2 className="mt-2 w-6 h-6 animate-spin text-slate-500" />
        ) : (
          <p className="mt-2 font-bold text-white text-3xl tracking-tight">
            {formatCurrency(metrics.dailySales, currency)}
          </p>
        )}
        <p className="flex items-center gap-1 mt-2 text-slate-400 text-xs">
          <span className="bg-yellow-500 rounded-full w-1.5 h-1.5"></span>
          Today
        </p>
      </div>

      {/* Net Profit (New) */}
      <div className="bg-slate-900/50 hover:bg-slate-900/80 p-6 border border-slate-800 rounded-2xl transition-colors glass-effect">
        <h3 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
          Net Profit (Est.)
        </h3>
        {loading ? (
          <Loader2 className="mt-2 w-6 h-6 animate-spin text-slate-500" />
        ) : (
          <p className="mt-2 font-bold text-white text-3xl tracking-tight">
            {formatCurrency(metrics.netProfit, currency)}
          </p>
        )}
        <p className="mt-2 text-slate-500 text-xs">
          Estimated for today
        </p>
      </div>

       {/* Chat / System (Existing) */}
       <div className="bg-gradient-to-b from-slate-900/50 to-slate-900/80 p-6 border border-slate-800 rounded-2xl glass-effect">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-200 text-xs">JunFue Chat</h3>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            System optimization recommended.
          </p>
          <Link href="/dashboard" className="block mt-3">
            <button className="bg-cyan-500/10 hover:bg-cyan-500/20 py-1.5 border border-cyan-500/50 rounded-lg w-full text-cyan-400 text-xs transition-colors">
              Open Chat
            </button>
          </Link>
        </div>
    </div>
  );
}
