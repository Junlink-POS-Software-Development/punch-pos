"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ExpensesNav, View } from "./utils/ExpensesNav";
import { Cashout } from "./components/cashout/Cashout";
import { CashFlow } from "./components/cashflow/CashFlow";
import { ExpensesBreakdown } from "./components/expenses-breakdown/ExpensesBreakdown";

function ExpensesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view");

  // --- DERIVED STATE (The Fix) ---
  // Instead of syncing local state with an effect (which causes the error),
  // we derive the active view directly from the URL.
  // If the URL param is valid, use it; otherwise, default to "cashout".
  const validViews = ["cashout", "monitor", "cashflow"];
  const currentView: View =
    viewParam && validViews.includes(viewParam)
      ? (viewParam as View)
      : "cashout";

  const handleViewChange = (newView: View) => {
    // We simply update the URL.
    // Next.js will detect the change, re-render this component,
    // and 'currentView' will automatically update based on the new params.
    router.push(`/expenses?view=${newView}`);
  };

  return (
    <div className="p-6 text-white pt-2">
      {/* --- Navigation --- */}
      <div className="bg-primary-light pt-2 pb-2 mx-4 rounded-2xl border border-slate-800/50 shadow-xl backdrop-blur-md bg-opacity-90 mb-6">
        <div className="px-6">
          <ExpensesNav currentView={currentView} setView={handleViewChange} />
        </div>
      </div>

      {/* --- Conditional Content --- */}
      <div>
        {currentView === "cashout" && <Cashout />}
        {currentView === "monitor" && <ExpensesBreakdown />}
        {currentView === "cashflow" && <CashFlow />}
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <ExpensesContent />
    </Suspense>
  );
}
