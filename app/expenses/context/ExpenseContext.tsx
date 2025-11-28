"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExpenses, createExpense, ExpenseData, ExpenseInput } from "../lib/expenses.api"; // Adjust path

interface ExpenseContextType {
  expenses: ExpenseData[];
  isLoading: boolean;
  isSubmitting: boolean;
  addExpense: (data: ExpenseInput) => Promise<void>;
  refresh: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // 1. Fetch
  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  // 2. Mutation
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

  const value = {
    expenses: expenses || [],
    isLoading,
    isSubmitting: mutation.isPending,
    addExpense,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenseContext must be used within an ExpenseProvider");
  }
  return context;
}