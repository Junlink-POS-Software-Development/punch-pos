import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchFinancialReport } from "../lib/dashboard.api";
import { CashFlowEntry } from "../lib/types";
import dayjs from "dayjs";

export interface DashboardMetrics {
  cashFlow: CashFlowEntry[];
  totalNetBalance: number;
  totalExpenses: number;
}

export function useDashboardMetrics(
  date: string = dayjs().format("YYYY-MM-DD")
) {
  // Use a unique key for the report data
  const {
    data: reportData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-financial-report", date],
    queryFn: () => fetchFinancialReport(date, date),
  });

  const metrics = useMemo(() => {
    // 1. Total Accumulated Cash (The "Big Number")
    // Sum of 'cash_on_hand' from all categories (includes idle ones)
    const totalNetBalance = reportData.reduce(
      (sum, entry) => sum + (Number(entry.cash_on_hand) || 0),
      0
    );

    // 2. Today's Expenses
    // Sum of 'expenses' (cash out) for this specific day
    const totalExpenses = reportData.reduce(
      (sum, entry) => sum + (Number(entry.expenses) || 0),
      0
    );

    // 3. Map the Report items to CashFlowEntry format for your UI
    // FinancialReportItem columns are slightly different, so we map them here.
    const cashFlow: CashFlowEntry[] = reportData.map((item) => ({
      // Assuming 'store_id' is not critical for the UI list, or you can fetch it if needed.
      // We map the report fields to the UI fields:
      category: item.category,
      date: date,
      forwarded: item.cash_forwarded,
      cash_in: item.gross_income,   // Report calls it 'gross_income', View called it 'cash_in'
      cash_out: item.expenses,      // Report calls it 'expenses', View called it 'cash_out'
      balance: item.cash_on_hand,   // Report calls it 'cash_on_hand', View called it 'balance'
    } as unknown as CashFlowEntry)); // Cast to satisfy TS if types strictly differ

    return { cashFlow, totalNetBalance, totalExpenses };
  }, [reportData, date]);

  return { data: metrics as DashboardMetrics, isLoading, error };
}