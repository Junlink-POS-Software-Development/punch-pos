import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchExpenses,
  createExpense,
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
  const queryKey = ["expenses", dateRange?.start, dateRange?.end];

  const { data: expenses, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchExpenses(dateRange?.start, dateRange?.end),
  });

  const addExpense = async (data: ExpenseInput) => {
    setIsSubmitting(true);
    try {
      await createExpense(data);
      // Invalidate the current view
      queryClient.invalidateQueries({ queryKey });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    expenses: expenses || [],
    isLoading,
    isSubmitting,
    addExpense,
    refresh: () => queryClient.invalidateQueries({ queryKey }),
  };
}
