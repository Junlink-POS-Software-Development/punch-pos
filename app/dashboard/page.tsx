"use client";

import React, { Suspense, useState } from "react";
import { useDashboard } from "./hooks/useDashboard";
import { HistoricalBanner } from "./components/pos-overview/HistoricalBanner";
import { DashboardHeader } from "./components/pos-overview/DashboardHeader";
import { VitalsGrid } from "./components/pos-overview/VitalsGrid";
import { InventoryAlerts } from "./components/pos-overview/InventoryAlerts";
import { CashoutModal } from "./components/pos-overview/CashoutModal";
import { CashFlowModal } from "./components/pos-overview/CashFlowModal";

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
    isFetching,
    lastUpdatedAt,
    isMultiDrawer,
    categorySales,
    handleManualRefresh,
  } = useDashboard();

  const [isCashFlowOpen, setIsCashFlowOpen] = useState(false);

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
          onRefresh={handleManualRefresh}
          isRefreshing={isFetching}
          onOpenCashFlow={() => setIsCashFlowOpen(true)}
        />

        {/* SECTION 1: THE VITALS */}
        {isLoading ? (
          <VitalsSkeleton />
        ) : (
          <VitalsGrid
            stats={stats}
            flipped={flipped}
            toggleFlip={toggleFlip}
            isHighRisk={isHighRisk}
            isHistorical={isHistorical}
            isMultiDrawer={isMultiDrawer}
            categorySales={categorySales}
            isFetching={isFetching}
            lastUpdatedAt={lastUpdatedAt}
          />
        )}


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
          isMultiDrawer={isMultiDrawer}
        />

        {/* CASH FLOW LEDGER MODAL */}
        <CashFlowModal
          isOpen={isCashFlowOpen}
          onClose={() => setIsCashFlowOpen(false)}
          isMultiDrawer={isMultiDrawer}
        />
      </div>
    </div>
  );
}

import { VitalsSkeleton } from "./components/pos-overview/VitalsSkeleton";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 pb-24 font-sans text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end mb-6 animate-pulse">
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-[38px] w-36 bg-card border border-border rounded-lg" />
            <div className="h-[38px] w-28 bg-card border border-border rounded-lg" />
            <div className="h-[38px] w-48 bg-card border border-border rounded-lg" />
            <div className="h-[38px] w-[38px] bg-card border border-border rounded-lg" />
          </div>
        </div>

        {/* Vitals Skeleton */}
        <VitalsSkeleton />

        {/* Alert Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card p-4 rounded-xl border border-border shadow-sm h-[300px] flex flex-col animate-pulse"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-muted" />
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
              <div className="space-y-2 flex-1 pt-2">
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="h-11 bg-muted/30 rounded-lg border border-border/40"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
