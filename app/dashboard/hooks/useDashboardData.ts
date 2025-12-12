import { useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

export type { DashboardMetrics, Transaction } from '../store/useDashboardStore';

export function useDashboardData() {
  const { metrics, isLoading, error, fetchMetrics } = useDashboardStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
        // Prevent double-fetching in strict mode or rapid remounts
        if (hasFetched.current) return;
        hasFetched.current = true;

        // Create a promise that rejects after 10 seconds
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error("Request timed out")), 10000);
        });

        try {
            // Race the fetch against the timeout
            await Promise.race([
                fetchMetrics(),
                timeoutPromise
            ]);
        } catch (err) {
            console.error("Dashboard data load failed:", err);
            // Optional: You can set a manual error state here if fetchMetrics doesn't catch it
        }   
    };

    loadData();

    return () => clearTimeout(timeoutId);
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: () => fetchMetrics(true),
  };
}