import { useDashboardContext } from "../context/DashboardContext";

// Re-export shared types so pages don't break
export type { DashboardMetrics, Transaction } from "../context/DashboardContext";

export function useDashboardData() {
  return useDashboardContext();
}