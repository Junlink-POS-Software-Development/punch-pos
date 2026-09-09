// app/transactions/page.tsx
"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { PaymentHistoryTable } from "./components/tables/PaymentHistoryTable";
import { TransactionHistoryTable } from "./components/tables/TransactionHistoryTable";
import { TransactionsNav, type TransactionsView } from "./components/TransactionsNav";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view");

  const activeView: TransactionsView =
    viewParam === "payments" ? "payments" : "history";

  const handleViewChange = useCallback(
    (view: TransactionsView) => {
      router.push(`/transactions?view=${view}`);
    },
    [router]
  );

  return (
    <div className="bg-background min-h-screen text-foreground p-6 space-y-4">
      {/* Navigation Tabs */}
      <TransactionsNav
        activeView={activeView}
        setActiveView={handleViewChange}
      />

      {/* Main Content Area - keep both components mounted for instant zero-lag switching */}
      <div className="slide-in-from-bottom-2 animate-in duration-300 fade-in">
        <div className={activeView === "history" ? "space-y-4" : "hidden"}>
          <h2 className="font-semibold text-foreground text-xl">
            Item Sales Log
          </h2>
          <TransactionHistoryTable />
        </div>
        <div className={activeView === "payments" ? "space-y-4" : "hidden"}>
          <h2 className="font-semibold text-foreground text-xl">
            Payment Transactions
          </h2>
          <PaymentHistoryTable />
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}

