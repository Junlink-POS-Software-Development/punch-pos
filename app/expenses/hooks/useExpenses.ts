// useExpenses.ts
import useSWR, { useSWRConfig } from "swr";
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
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SWR Key includes dates, so it auto-refetches when they change
  const swrKey = ["expenses", dateRange?.start, dateRange?.end];

  const { data: expenses, isLoading } = useSWR(swrKey, ([_, start, end]) =>
    fetchExpenses(start, end)
  );

  const addExpense = async (data: ExpenseInput) => {
    setIsSubmitting(true);
    try {
      await createExpense(data);
      // Invalidate the current view
      mutate(swrKey);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    expenses: expenses || [],
    isLoading,
    isSubmitting,
    addExpense,
    refresh: () => mutate(swrKey),
  };
}
