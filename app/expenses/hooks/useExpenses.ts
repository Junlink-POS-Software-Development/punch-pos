import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
  ExpenseInput,
} from "../lib/expenses.api";

export interface DateRange {
  start: string;
  end: string;
}

export function useExpenses(dateRange?: DateRange) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query Key includes dates, so it auto-refetches when they change
  const queryKey = useMemo(() => ["expenses", dateRange?.start, dateRange?.end], [dateRange?.start, dateRange?.end]);

  const { data: expenses, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchExpenses(dateRange?.start, dateRange?.end),
  });

  const addExpense = useCallback(async (data: ExpenseInput) => {
    setIsSubmitting(true);
    try {
      await createExpense(data);
      // Invalidate the current view
      queryClient.invalidateQueries({ queryKey });
    } finally {
      setIsSubmitting(false);
    }
  }, [queryClient, queryKey]);

  const removeExpense = useCallback(async (id: string) => {
    try {
      await deleteExpense(id);
      // Invalidate to refresh the list
      queryClient.invalidateQueries({ queryKey });
    } catch (error) {
      console.error("Failed to delete expense:", error);
      throw error;
    }
  }, [queryClient, queryKey]);

  return {
    expenses: expenses || [],
    isLoading,
    isSubmitting,
    addExpense,
    removeExpense,
    refresh: useCallback(() => queryClient.invalidateQueries({ queryKey }), [queryClient, queryKey]),
  };
}
