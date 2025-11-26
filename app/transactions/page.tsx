// app/transactions/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import TransactionsNav, {
  TransactionsView,
} from "./components/TransactionsNav";

import { PaymentHistoryTable } from "./components/tables/PaymentHistoryTable";
import { TransactionHistoryTable } from "./components/tables/TransactionHistoryTable";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view") as TransactionsView | null;

  const [activeView, setActiveView] = useState<TransactionsView>("history");

  // Sync state with URL param
  useEffect(() => {
    if (viewParam && ["history", "payments"].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, [viewParam]);

  const handleViewChange = (view: TransactionsView) => {
    setActiveView(view);
    router.push(`/transactions?view=${view}`);
  };

  const renderView = () => {
    switch (activeView) {
      case "history":
        return (
          <div className="space-y-4 p-6">
            <h2 className="font-semibold text-slate-300 text-xl">
              Item Sales Log
            </h2>
            <TransactionHistoryTable />
          </div>
        );
      case "payments":
        return (
          <div className="space-y-4 p-6">
            <h2 className="font-semibold text-slate-300 text-xl">
              Payment Transactions
            </h2>
            <PaymentHistoryTable />
          </div>
        );
      default:
        return <TransactionHistoryTable />;
    }
  };

  return (
    <div className="bg-[#0B1120] min-h-screen text-white">
      {" "}
      {/* Dark bg match */}
      <div className="bg-primary-light">
        {/* --- BACK BUTTON --- */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-2 pt-2 pl-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* --- HEADER & NAVIGATION --- */}
        <div className="flex justify-between items-end pb-2">
          <h1 className="pl-4 font-bold text-3xl tracking-tight">
            Transactions
          </h1>
        </div>
      </div>
      {/* Sticky Nav Bar */}
      <div className="top-0 z-10 sticky bg-primary-light/95 backdrop-blur-2xl border-slate-800 border-b">
        <TransactionsNav
          activeView={activeView}
          setActiveView={handleViewChange}
        />
      </div>
      {/* Main Content Area */}
      <div className="slide-in-from-bottom-2 animate-in duration-300 fade-in">
        {renderView()}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
