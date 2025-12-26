import useSWR from "swr";
import { useMemo } from "react";
import { fetchDailyCashFlow } from "../lib/dashboard.api";
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
  const {
    data: cashFlow = [],
    isLoading,
    error,
  } = useSWR(["dashboard-metrics", date], ([_, date]) =>
    fetchDailyCashFlow(date)
  );

  const metrics = useMemo(() => {
    const totalNetBalance = cashFlow.reduce(
      (sum, entry) => sum + (Number(entry.balance) || 0),
      0
    );
    const totalExpenses = cashFlow.reduce(
      (sum, entry) => sum + (Number(entry.cash_out) || 0),
      0
    );

    return { cashFlow, totalNetBalance, totalExpenses };
  }, [cashFlow]);

  return { data: metrics as DashboardMetrics, isLoading, error };
}
