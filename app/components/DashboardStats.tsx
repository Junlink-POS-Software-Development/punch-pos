"use client";

import { TrendingDown, Brain, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { formatCurrency } from "@/lib/utils/currency";

export function DashboardStats() {
  const { currency } = useSettings();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    dailySales: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // 1. Total Customers
        const { data: customersData, error: customersError } = await supabase
          .from("payments")
          .select("customer_name");
        
        if (customersError) throw customersError;
        
        const uniqueCustomers = new Set(
          customersData?.map((c) => c.customer_name).filter(Boolean)
        ).size;

        // 2. Daily Sales
        const { data: salesData, error: salesError } = await supabase
          .from("payments")
          .select("grand_total, transaction_time");

        if (salesError) throw salesError;

        const todaySales = salesData
          ?.filter((p) => {
            if (!p.transaction_time) return false;
            return dayjs(p.transaction_time).isSame(dayjs(), 'day');
          })
          .reduce((sum, p) => sum + (Number(p.grand_total) || 0), 0);

        setMetrics({
          totalCustomers: uniqueCustomers,
          dailySales: todaySales || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="gap-8 grid grid-cols-1 md:grid-cols-2 mt-10">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-6">
        <div className="bg-slate-900/50 hover:bg-slate-900/80 p-8 border border-slate-800 rounded-2xl transition-colors glass-effect">
          <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">
            Total Customers
          </h3>
          {loading ? (
            <Loader2 className="mt-4 w-8 h-8 animate-spin text-slate-500" />
          ) : (
            <p className="mt-4 font-bold text-white text-6xl tracking-tighter">
              {metrics.totalCustomers.toLocaleString()}
            </p>
          )}
          <p className="flex items-center gap-2 mt-3 font-medium text-green-400 text-base">
            <TrendingDown className="w-5 h-5 rotate-180" />
            Unique customers
          </p>
        </div>

        <div className="bg-slate-900/50 hover:bg-slate-900/80 p-8 border border-slate-800 rounded-2xl transition-colors glass-effect">
          <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">
            Daily Sales
          </h3>
          {loading ? (
            <Loader2 className="mt-4 w-8 h-8 animate-spin text-slate-500" />
          ) : (
            <p className="mt-4 font-bold text-white text-6xl tracking-tighter">
              {formatCurrency(metrics.dailySales, currency)}
            </p>
          )}
          <p className="flex items-center gap-2 mt-3 text-slate-400 text-base">
            <span className="bg-yellow-500 rounded-full w-2 h-2"></span>
            For today
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-6">
        <div className="flex-1 bg-gradient-to-b from-slate-900/50 to-slate-900/80 p-8 border border-slate-800 rounded-2xl glass-effect">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-cyan-400" />
            <h3 className="font-semibold text-slate-200">JunFue Chat</h3>
          </div>
          <div className="space-y-4 text-slate-300">
            <div className="flex items-start gap-3">
              <div className="bg-cyan-500 mt-2 rounded-full w-1.5 h-1.5 shrink-0"></div>
              <p className="text-sm leading-relaxed">
                System optimization recommended for inventory module.
              </p>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="w-full">
          <button className="group hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,189,212,0.15)] p-4 border border-slate-700 hover:border-cyan-500 rounded-xl w-full font-semibold text-white text-lg transition-all glass-effect">
            See More Details
          </button>
        </Link>
      </div>
    </div>
  );
}
