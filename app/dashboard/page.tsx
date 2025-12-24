"use client";

import React, { useState } from "react";
import { Loader2, ArrowBigLeft } from "lucide-react";
import { FinancialReportContainer } from "./components/financial-report/FinancialReportContainer";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics";
import { DashboardGrid } from "./components/DashboardGrid";
import Link from "next/link";
import { InventorySummary } from "./components/InventorySummary";
import { DashboardNav, DashboardView } from "./utils/DashboardNav";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const DEFAULT_ITEMS = [
  "cash-on-hand",
  "daily-gross",
  "daily-expenses",
  "monthly-gross",
];

export default function DashboardPage() {
  // --- URL State Management ---
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Derive active view from URL
  const viewParam = searchParams.get("view");
  const validViews = ["grid", "report"];

  const viewMode: DashboardView =
    viewParam && validViews.includes(viewParam)
      ? (viewParam as DashboardView)
      : "grid"; // Default to "grid" if param is missing or invalid

  // 2. Handle View Change
  const setViewMode = (newView: DashboardView) => {
    // Create new params object to preserve other potential query params
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);

    // Update URL without reloading the page
    router.push(`${pathname}?${params.toString()}`);
  };

  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);

  const { data: metrics, isLoading, error } = useDashboardMetrics();

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl">
      {/* Header & View Switcher */}
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-2 pt-2 pl-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowBigLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="pl-2 font-bold text-white text-3xl tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* Navigation Component */}
        <DashboardNav currentView={viewMode} setView={setViewMode} />
      </div>

      {/* Content Area */}
      <div className="slide-in-from-bottom-4 animate-in duration-500 fade-in">
        {viewMode === "grid" ? (
          // GRID VIEW
          isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-10 text-red-400 text-center">
              Error loading dashboard metrics.
            </div>
          ) : (
            <div className="space-y-6">
              <DashboardGrid
                metrics={metrics}
                items={items}
                onOrderChange={setItems}
              />
              <InventorySummary />
            </div>
          )
        ) : (
          // REPORT VIEW
          <FinancialReportContainer />
        )}
      </div>
    </div>
  );
}
