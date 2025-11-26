"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ExpensesNav, View } from "./utils/ExpensesNav";
import { Cashout } from "./components/Cashout";
import { ExpensesMntr } from "./components/ExpensesMntr";
import { CashFlow } from "./components/CashFlow";

function ExpensesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view") as View | null;

  const [view, setView] = useState<View>("cashout");

  // Sync state with URL param
  useEffect(() => {
    if (viewParam && ["cashout", "monitor", "cashflow"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const handleViewChange = (newView: View) => {
    setView(newView);
    router.push(`/expenses?view=${newView}`);
  };

  return (
    <div className="p-6 text-white">
      {/* --- Back Button --- */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-4 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <h1 className="mb-4 font-bold text-2xl">Expenses Management</h1>
      {/* HEADER BORDER */}
      <div className="mb-8 border border-slate-700"></div>

      {/* --- Navigation --- */}
      <ExpensesNav currentView={view} setView={handleViewChange} />

      {/* --- Conditional Content --- */}
      <div>
        {view === "cashout" && <Cashout />}
        {view === "monitor" && <ExpensesMntr />}
        {view === "cashflow" && <CashFlow />}
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
