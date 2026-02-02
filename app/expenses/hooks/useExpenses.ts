import { useQuery, useQueryClient, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import {
  fetchExpenses,
  fetchExpensesPaginated,
  createExpense,
  updateExpense,
  deleteExpense,
  ExpenseInput,
  ExpenseData,
} from "../lib/expenses.api";

export interface DateRange {
  start: string;
  end: string;
}

// Extended type for optimistic UI
type OptimisticExpenseData = ExpenseData & {
  _optimistic?: boolean;
  _syncing?: boolean;
};

// Original hook for backwards compatibility
export function useExpenses(dateRange?: DateRange) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = useMemo(
    () => ["expenses", dateRange?.start, dateRange?.end],
    [dateRange?.start, dateRange?.end]
  );

  const { data: expenses, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchExpenses(dateRange?.start, dateRange?.end),
  });

  const addExpense = useCallback(
    async (data: ExpenseInput) => {
      setIsSubmitting(true);
      try {
        await createExpense(data);
        queryClient.invalidateQueries({ queryKey });
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey]
  );

  const editExpense = useCallback(
    async (id: string, data: ExpenseInput) => {
      setIsSubmitting(true);
      try {
        await updateExpense(id, data);
        queryClient.invalidateQueries({ queryKey });
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient, queryKey]
  );

  const removeExpense = useCallback(
    async (id: string) => {
      try {
        await deleteExpense(id);
        queryClient.invalidateQueries({ queryKey });
      } catch (error) {
        console.error("Failed to delete expense:", error);
        throw error;
      }
    },
    [queryClient, queryKey]
  );

  return {
    expenses: expenses || [],
    isLoading,
    isSubmitting,
    addExpense,
    editExpense,
    removeExpense,
    refresh: useCallback(
      () => queryClient.invalidateQueries({ queryKey }),
      [queryClient, queryKey]
    ),
  };
}

// New hook for infinite scroll with optimistic updates
export function useExpensesInfinite(pageSize: number = 30, dateRange?: DateRange) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ["expenses-infinite", pageSize, dateRange?.start, dateRange?.end],
    [pageSize, dateRange?.start, dateRange?.end]
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchExpensesPaginated(
        pageParam as number,
        pageSize,
        dateRange?.start,
        dateRange?.end
      );
      return {
        data: result.data,
        count: result.count,
        nextPage: result.data.length === pageSize ? (pageParam as number) + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });

  // Flatten pages into a single list
  const expenses: OptimisticExpenseData[] = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const totalRecords = data?.pages[0]?.count ?? 0;

  // Optimistic Add
  const addExpenseOptimistic = useCallback(
    async (input: ExpenseInput) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticExpense: OptimisticExpenseData = {
        id: tempId,
        transaction_date: input.transaction_date,
        source: input.source,
        classification_id: input.classification,
        classification: input.classification, // Will be replaced after refetch
        amount: input.amount,
        receipt_no: input.receipt_no,
        notes: input.notes,
        _optimistic: true,
        _syncing: true,
      };

      // Optimistically add to cache (prepend to first page)
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          data: [optimisticExpense, ...newPages[0].data],
        };
        return { ...old, pages: newPages };
      });

      try {
        await createExpense(input);
        // Refetch to get the real data
        queryClient.invalidateQueries({ queryKey });
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          const newPages = old.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((e: OptimisticExpenseData) => e.id !== tempId),
          }));
          return { ...old, pages: newPages };
        });
        throw error;
      }
    },
    [queryClient, queryKey]
  );

  // Optimistic Edit
  const editExpenseOptimistic = useCallback(
    async (id: string, input: ExpenseInput) => {
      // Store previous data for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const newPages = old.pages.map((page: any) => ({
          ...page,
          data: page.data.map((e: OptimisticExpenseData) =>
            e.id === id
              ? {
                  ...e,
                  transaction_date: input.transaction_date,
                  source: input.source,
                  classification: input.classification,
                  amount: input.amount,
                  receipt_no: input.receipt_no,
                  notes: input.notes,
                  _syncing: true,
                }
              : e
          ),
        }));
        return { ...old, pages: newPages };
      });

      try {
        await updateExpense(id, input);
        queryClient.invalidateQueries({ queryKey });
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData(queryKey, previousData);
        throw error;
      }
    },
    [queryClient, queryKey]
  );

  // Optimistic Delete
  const removeExpenseOptimistic = useCallback(
    async (id: string) => {
      // Store previous data for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically remove
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const newPages = old.pages.map((page: any) => ({
          ...page,
          data: page.data.filter((e: OptimisticExpenseData) => e.id !== id),
        }));
        return { ...old, pages: newPages };
      });

      try {
        await deleteExpense(id);
        queryClient.invalidateQueries({ queryKey });
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData(queryKey, previousData);
        throw error;
      }
    },
    [queryClient, queryKey]
  );

  return {
    expenses,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    totalRecords,
    addExpense: addExpenseOptimistic,
    editExpense: editExpenseOptimistic,
    removeExpense: removeExpenseOptimistic,
    refresh: useCallback(
      () => queryClient.invalidateQueries({ queryKey }),
      [queryClient, queryKey]
    ),
  };
}
