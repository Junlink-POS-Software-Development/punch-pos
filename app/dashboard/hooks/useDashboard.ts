"use client";

import { useState, FormEvent } from "react";
import {
  type DashboardStats,
  type InventoryStatsData,
  type ActivityItem,
} from "../lib/dashboardMockData";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchHasVoucherSource, fetchLatestCategorySales } from "../lib/dashboard.api";

export type FlipCardKey = "sales" | "profit" | "cash" | "cashout";
export type ExpenseCategory = "COGS" | "OPEX" | "REMIT";

export function useDashboard() {
  // ─── Date Filter ───────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const isHistorical = selectedDate !== todayStr;

  // ─── Core Data Fetching ────────────────────────────────────────────────────
  const { data: serverStats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", selectedDate],
    queryFn: () => fetchDashboardStats(selectedDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ─── Multi-Drawer Detection ────────────────────────────────────────────────
  const { data: isMultiDrawer = false } = useQuery({
    queryKey: ["has-voucher-source"],
    queryFn: fetchHasVoucherSource,
    staleTime: 1000 * 60 * 30, // 30 minutes — rarely changes
  });

  // ─── Categorical Cash Flow (only in multi-drawer mode) ─────────────────────
  const { data: categorySales = [] } = useQuery({
    queryKey: ["daily-category-sales", selectedDate],
    queryFn: () => fetchLatestCategorySales(selectedDate),
    enabled: isMultiDrawer,
    staleTime: 1000 * 60 * 5,
  });

  // Zeroed out stats as default instead of mock data
  const emptyStats: DashboardStats = {
    grossSales: 0,
    salesDiscount: 0,
    salesReturn: 0,
    salesAllowance: 0,
    netSales: 0,
    cashInDrawer: 0,
    cashout: {
      total: 0,
      cogs: 0,
      opex: 0,
      remittance: 0,
    },
    netProfit: 0,
  };

  const stats: DashboardStats = serverStats || emptyStats;
  const [inventoryStats] = useState<InventoryStatsData>({
    lowStock: [],
    mostStocked: { name: "N/A", qty: 0 },
    expiringSoon: [],
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

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
  // ─── Derived Values ────────────────────────────────────────────────────────
  const CASH_LIMIT = 10000.0; // Hardcoded for now or fetch from settings
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

    // Note: Local state update for stats is removed because stats are now fetched from server.
    // Recording an expense should ideally call an API and invalidate the dashboard-stats query.
    
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
    isLoading,

    // Multi-drawer
    isMultiDrawer,
    categorySales,
  };
}
