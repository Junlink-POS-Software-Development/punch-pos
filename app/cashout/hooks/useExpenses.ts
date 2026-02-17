import { useQuery, useQueryClient, useInfiniteQuery, keepPreviousData, InfiniteData } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import {
  fetchExpenses,
  fetchExpensesPaginated,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchExpensesSummary,
  fetchUserPermissions,
  CashoutInput,
  CashoutRecord,
  CashoutPermissions,
} from "../lib/cashout.api";

export interface DateRange {
  start: string;
  end: string;
}

// Extended type for optimistic UI
type OptimisticCashoutRecord = CashoutRecord & {
  _optimistic?: boolean;
  _syncing?: boolean;
};

interface CashoutPage {
  data: OptimisticCashoutRecord[];
  count: number;
  nextPage?: number;
}

// Shared query key prefix for all expense-related data
const EXPENSES_KEY = "expenses";

// Original hook for backwards compatibility
export function useExpenses(dateRange?: DateRange) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryKey = useMemo(
    () => [EXPENSES_KEY, "list", dateRange?.start, dateRange?.end],
    [dateRange?.start, dateRange?.end]
  );

  const { data: expenses, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchExpenses(dateRange?.start, dateRange?.end),
  });

  const addExpense = useCallback(
    async (data: CashoutInput) => {
      setIsSubmitting(true);
      try {
        await createExpense(data);
        // Invalidate all expense queries to ensure freshness everywhere
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient]
  );

  const editExpense = useCallback(
    async (id: string, data: CashoutInput) => {
      setIsSubmitting(true);
      try {
        await updateExpense(id, data);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      } finally {
        setIsSubmitting(false);
      }
    },
    [queryClient]
  );

  const removeExpense = useCallback(
    async (id: string) => {
      try {
        await deleteExpense(id);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      } catch (error) {
        console.error("Failed to delete expense:", error);
        throw error;
      }
    },
    [queryClient]
  );

  return {
    expenses: expenses || [],
    isLoading,
    isSubmitting,
    addExpense,
    editExpense,
    removeExpense,
    refresh: useCallback(
      () => queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
      [queryClient]
    ),
  };
}

// New hook for infinite scroll with optimistic updates
export function useExpensesInfinite(pageSize: number = 30, dateRange?: DateRange) {
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => [EXPENSES_KEY, "infinite", pageSize, dateRange?.start, dateRange?.end],
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
  const expenses: OptimisticCashoutRecord[] = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const totalRecords = data?.pages[0]?.count ?? 0;

  // Optimistic Add
  const addExpenseOptimistic = useCallback(
    async (input: CashoutInput) => {
      const tempId = `temp-${Date.now()}`;
      // Basic optimistic record - simplified
      const optimistic: OptimisticCashoutRecord = {
        id: tempId,
        date: input.transaction_date,
        timestamp: new Date().toLocaleTimeString(),
        created_at: new Date().toISOString(),
        category: input.cashout_type,
        amount: input.amount,
        notes: input.notes,
        receiptNo: input.receipt_no,
        expenseCategory: input.expenseCategory, // approximate
        product: input.product || input.source, // approximate
        _optimistic: true,
        _syncing: true,
      };

      // Optimistically add to cache (prepend to first page) for THIS query
      queryClient.setQueryData<InfiniteData<CashoutPage>>(queryKey, (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          data: [optimistic, ...newPages[0].data],
        };
        return { ...old, pages: newPages };
      });

      try {
        await createExpense(input);
        // Invalidate all expense queries to ensure freshness everywhere
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      } catch (error) {
        // Rollback on error
        queryClient.setQueryData<InfiniteData<CashoutPage>>(queryKey, (old) => {
          if (!old) return old;
          const newPages = old.pages.map((page) => ({
            ...page,
            data: page.data.filter((e) => e.id !== tempId),
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
    async (id: string, input: CashoutInput) => {
      // Store previous data for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData<InfiniteData<CashoutPage>>(queryKey, (old) => {
        if (!old) return old;
        const newPages = old.pages.map((page) => ({
          ...page,
          data: page.data.map((e) =>
            e.id === id
              ? {
                  ...e,
                  date: input.transaction_date,
                  category: input.cashout_type,
                  amount: input.amount,
                  notes: input.notes,
                  receiptNo: input.receipt_no,
                  _syncing: true,
                }
              : e
          ),
        }));
        return { ...old, pages: newPages };
      });

      try {
        await updateExpense(id, input);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
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
      queryClient.setQueryData<InfiniteData<CashoutPage>>(queryKey, (old) => {
        if (!old) return old;
        const newPages = old.pages.map((page) => ({
          ...page,
          data: page.data.filter((e) => e.id !== id),
        }));
        return { ...old, pages: newPages };
      });

      try {
        await deleteExpense(id);
        await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
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
      () => queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
      [queryClient]
    ),
  };
}


// Hook for fetching permissions
export function useCashoutPermissions() {
  const { data: permissions, isLoading } = useQuery({
    queryKey: [EXPENSES_KEY, "permissions"],
    queryFn: fetchUserPermissions,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    permissions: permissions || { can_manage_expenses: false },
    isLoading,
  };
}


// New hook for summary cards
export function useExpensesSummary(dateRange?: DateRange) {
  const queryKey = useMemo(
    () => [EXPENSES_KEY, "summary", dateRange?.start, dateRange?.end],
    [dateRange?.start, dateRange?.end]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchExpensesSummary(dateRange?.start, dateRange?.end),
  });

  return {
    summary: data || { totalAmount: 0, totalCount: 0 },
    isLoading,
    error,
  };
}
