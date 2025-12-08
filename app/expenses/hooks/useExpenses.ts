import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExpenses, createExpense, ExpenseData, ExpenseInput } from "../lib/expenses.api";

export function useExpenses() {
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const mutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const addExpense = async (data: ExpenseInput) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  };

  return {
    expenses: expenses || [],
    isLoading,
    isSubmitting: mutation.isPending,
    addExpense,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  };
}
