import { useEffect } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

// Re-export shared types so pages don't break
export type { DashboardMetrics, Transaction } from '../store/useDashboardStore';

export function useDashboardData() {
  const { metrics, isLoading, error, fetchMetrics } = useDashboardStore();

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: () => fetchMetrics(true),
  };
}