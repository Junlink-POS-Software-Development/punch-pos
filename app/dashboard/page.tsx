"use client";

import React, { Suspense, useState } from "react";
import { Loader2, ArrowBigLeft } from "lucide-react";
import { FinancialReportContainer } from "./components/financial-report/FinancialReportContainer";
import { DashboardGrid } from "./components/overview/DashboardGrid";
import Link from "next/link";
import { InventorySummary } from "./components/overview/InventorySummary";
import { DashboardNav, DashboardView } from "./utils/DashboardNav";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const DEFAULT_ITEMS = [
  "cash-on-hand",
  "daily-gross",
  "daily-expenses",
  "monthly-gross",
  "quantity-sold",
];

export function DashboardContent() {
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

  return (
    <div className="space-y-6 mx-auto p-6 max-w-7xl pt-2">
      {/* Header & View Switcher - TITLE MOVED TO GLOBAL HEADER */}
      {/* Navigation Component */}
      <div className="bg-primary-light pt-2 pb-2 mx-auto rounded-2xl border border-slate-800/50 shadow-xl backdrop-blur-md bg-opacity-90 w-full mb-6 max-w-7xl">
        <div className="px-6">
          <DashboardNav currentView={viewMode} setView={setViewMode} />
        </div>
      </div>

      {/* Content Area */}
      <div className="slide-in-from-bottom-4 animate-in duration-500 fade-in">
        {viewMode === "grid" ? (
          // GRID VIEW
          <div className="space-y-6">
            <DashboardGrid items={items} onOrderChange={setItems} />
            <InventorySummary />
          </div>
        ) : (
          // REPORT VIEW
          <FinancialReportContainer />
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // FIX: Added the 'return' keyword below
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
