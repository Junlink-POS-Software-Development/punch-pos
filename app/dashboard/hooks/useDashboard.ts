"use client";

import { useState, FormEvent } from "react";
import {
  INITIAL_STATS,
  INITIAL_INVENTORY_STATS,
  INITIAL_RECENT_ACTIVITY,
  CASH_LIMIT,
  type DashboardStats,
  type InventoryStatsData,
  type ActivityItem,
} from "../lib/dashboardMockData";

export type FlipCardKey = "sales" | "profit" | "cash" | "cashout";
export type ExpenseCategory = "COGS" | "OPEX" | "REMIT";

export function useDashboard() {
  // ─── Date Filter ───────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const isHistorical = selectedDate !== todayStr;

  // ─── Core Data State ───────────────────────────────────────────────────────
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [inventoryStats] = useState<InventoryStatsData>(INITIAL_INVENTORY_STATS);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>(INITIAL_RECENT_ACTIVITY);

  // ─── Flip Card State ───────────────────────────────────────────────────────
  const [flipped, setFlipped] = useState<Record<FlipCardKey, boolean>>({
    sales: false,
    profit: false,
    cash: false,
    cashout: false,
  });

  const toggleFlip = (card: FlipCardKey) => {
    setFlipped((prev) => ({ ...prev, [card]: !prev[card] }));
  };

  // ─── Expense / Cashout Modal State ─────────────────────────────────────────
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseReason, setExpenseReason] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("OPEX");

  // ─── Derived Values ────────────────────────────────────────────────────────
  const isHighRisk = !isHistorical && stats.cashInDrawer > CASH_LIMIT;

  // ─── Time State ────────────────────────────────────────────────────────────
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  // Update time every minute
  if (typeof window !== "undefined") {
    // Basic implementation for client-side
    // In a real app, use useEffect
  }
  
  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleAddExpense = (e: FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseReason || isHistorical) return;

    const amount = parseFloat(expenseAmount);

    setStats((prev) => {
      const newCashout = { ...prev.cashout };
      newCashout.total += amount;
      if (expenseCategory === "OPEX") newCashout.opex += amount;
      if (expenseCategory === "COGS") newCashout.cogs += amount;
      if (expenseCategory === "REMIT") newCashout.remittance += amount;

      return {
        ...prev,
        cashInDrawer: prev.cashInDrawer - amount,
        cashout: newCashout,
        netProfit: prev.netSales - newCashout.cogs - newCashout.opex,
      };
    });

    const newActivity: ActivityItem = {
      id: Date.now(),
      type: expenseCategory,
      amount: -amount,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      desc: expenseReason,
    };

    setRecentActivity((prev) => [newActivity, ...prev].slice(0, 6));
    setIsExpenseModalOpen(false);
    setExpenseAmount("");
    setExpenseReason("");
  };

  return {
    // Date
    todayStr,
    selectedDate,
    setSelectedDate,
    isHistorical,
    time,

    // Data
    stats,
    inventoryStats,
    recentActivity,

    // Flip cards
    flipped,
    toggleFlip,

    // Expense modal
    isExpenseModalOpen,
    setIsExpenseModalOpen,
    expenseAmount,
    setExpenseAmount,
    expenseReason,
    setExpenseReason,
    expenseCategory,
    setExpenseCategory,
    handleAddExpense,

    // Derived
    isHighRisk,
  };
}
