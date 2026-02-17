"use client";

import React, { Suspense } from "react";
import { useDashboard } from "./hooks/useDashboard";
import { HistoricalBanner } from "./components/pos-overview/HistoricalBanner";
import { DashboardHeader } from "./components/pos-overview/DashboardHeader";
import { VitalsGrid } from "./components/pos-overview/VitalsGrid";
import { PaymentMethods } from "./components/pos-overview/PaymentMethods";
import { ActivityFeed } from "./components/pos-overview/ActivityFeed";
import { InventoryAlerts } from "./components/pos-overview/InventoryAlerts";
import { CashoutModal } from "./components/pos-overview/CashoutModal";

const STORE_NAME = "Punch POS"; // Or specific store name

function DashboardContent() {
  const {
    todayStr,
    time,
    selectedDate,
    setSelectedDate,
    isHistorical,
    stats,
    inventoryStats,
    recentActivity,
    flipped,
    toggleFlip,
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    expenseAmount,
    setExpenseAmount,
    expenseReason,
    setExpenseReason,
    expenseCategory,
    setExpenseCategory,
    handleAddExpense,
    isHighRisk,
    isLoading,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 pb-24 font-sans text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* HISTORICAL MODE BANNER */}
        {isHistorical && (
          <HistoricalBanner
            selectedDate={selectedDate}
            onReturnToToday={() => setSelectedDate(todayStr)}
          />
        )}

        {/* HEADER */}
        <DashboardHeader
          storeName={STORE_NAME}
          today={todayStr}
          time={time}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          isHistoricalView={isHistorical}
        />

        {/* SECTION 1: THE VITALS */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-card/50 rounded-xl border border-border" />
            ))}
          </div>
        ) : (
          <VitalsGrid
            stats={stats}
            flipped={flipped}
            toggleFlip={toggleFlip}
            isHighRisk={isHighRisk}
            isHistorical={isHistorical}
          />
        )}

        {/* SECTION 2: OPERATIONS & ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <PaymentMethods />
          <ActivityFeed recentActivity={recentActivity} />
        </div>

        {/* SECTION 3: INVENTORY ALERTS */}
        <InventoryAlerts inventoryStats={inventoryStats} />

        {/* CASHOUT / EXPENSE MODAL */}
        <CashoutModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          expenseAmount={expenseAmount}
          setExpenseAmount={setExpenseAmount}
          expenseReason={expenseReason}
          setExpenseReason={setExpenseReason}
          expenseCategory={expenseCategory}
          setExpenseCategory={setExpenseCategory}
          onSubmit={handleAddExpense}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-foreground">Loading...</div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
