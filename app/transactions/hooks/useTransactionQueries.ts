import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { TransactionItem, PaymentRecord } from "../types";
import { useAuthStore } from "@/store/useAuthStore";

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  [key: string]: string | undefined;
}

// --- 1. Hook for Line Items History ---
export const useTransactionHistory = (
  pageSize: number,
  filters: TransactionFilters = {}
) => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: ["transaction-items", pageSize, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const { getTransactionHistory } = await import("@/app/actions/transactions");
      const result = await getTransactionHistory(pageParam as number, pageSize, filters);

      if (!result.success) {
        throw new Error(result.error);
      }

      const formattedData = (result.data as any[]).map(
        (item) => ({
          transactionNo: item.invoice_no || "N/A",
          transactionTime: item.transaction_time 
            ? new Date(item.transaction_time).toLocaleString() 
            : "N/A", 
          barcode: item.sku,
          ItemName: item.item_name,
          unitPrice: item.cost_price,
          discount: item.discount,
          quantity: item.quantity,
          totalPrice: item.total_price,
        })
      ) as TransactionItem[];

      return {
        data: formattedData,
        count: result.count || 0,
        nextPage: (result.data as any[]).length === pageSize ? (pageParam as number) + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  });
};

// --- 2. Hook for Payment/Header History ---
export const usePaymentHistory = (
  pageSize: number = 50,
  filters: TransactionFilters = {}
) => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: ["payments", pageSize, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const { getPaymentHistory } = await import("@/app/actions/transactions");
      const result = await getPaymentHistory(pageParam as number, pageSize, filters);

      if (!result.success) {
        throw new Error(result.error);
      }

      const formattedData = (result.data as any[]).map((p) => ({
        id: p.id,
        transactionNo: p.invoice_no,
        transactionTime: new Date(p.transaction_time).toLocaleString(),
        customerName: p.customer_name,
        amountRendered: p.amount_rendered ?? 0,
        voucher: p.voucher ?? 0,
        grandTotal: p.grand_total ?? 0,
        change: p.change ?? 0,
      })) as PaymentRecord[];

      return {
        data: formattedData,
        count: result.count || 0,
        nextPage: (result.data as any[]).length === pageSize ? (pageParam as number) + 1 : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: isAuthenticated,
    placeholderData: keepPreviousData,
  });
};