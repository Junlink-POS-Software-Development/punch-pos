import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { TransactionItem } from "../types";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getTransactionHistory,
  getPaymentHistory,
  type TransactionRecord,
  type PaymentRecord,
} from "@/app/actions/transactions";
import {
  formatPaymentRecord,
  DEFAULT_PAYMENT_PAGE_SIZE,
  PaymentInfinitePage,
} from "../lib/paymentCache";

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  [key: string]: string | undefined;
}

export interface TransactionInfinitePage {
  data: TransactionItem[];
  count: number;
  nextPage?: number;
}

// --- 1. Hook for Line Items History ---
export const useTransactionHistory = (
  pageSize: number = DEFAULT_PAYMENT_PAGE_SIZE,
  filters: TransactionFilters = {}
) => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery<TransactionInfinitePage>({
    queryKey: ["transaction-items", pageSize, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getTransactionHistory(pageParam as number, pageSize, filters);

      if (!result.success) {
        throw new Error(result.error);
      }

      const rows = (result.data || []) as TransactionRecord[];
      const formattedData: TransactionItem[] = rows.map((item) => ({
        transactionNo: item.invoice_no || "N/A",
        transactionTime: item.transaction_time
          ? new Date(item.transaction_time).toLocaleString()
          : "N/A",
        barcode: item.sku,
        ItemName: item.item_name,
        unitPrice: item.sales_price,
        discount: item.discount,
        quantity: item.quantity,
        totalPrice: item.total_price,
      }));

      return {
        data: formattedData,
        count: result.count || 0,
        nextPage: rows.length === pageSize ? (pageParam as number) + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated,
  });
};

// --- 2. Hook for Payment/Header History ---
export const usePaymentHistory = (
  pageSize: number = DEFAULT_PAYMENT_PAGE_SIZE,
  filters: TransactionFilters = {}
) => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery<PaymentInfinitePage>({
    queryKey: ["payments", pageSize, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getPaymentHistory(pageParam as number, pageSize, filters);

      if (!result.success) {
        throw new Error(result.error);
      }

      const rows = (result.data || []) as PaymentRecord[];
      const formattedData = rows.map((p) => formatPaymentRecord(p));

      return {
        data: formattedData,
        count: result.count || 0,
        nextPage: rows.length === pageSize ? (pageParam as number) + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated,
  });
};