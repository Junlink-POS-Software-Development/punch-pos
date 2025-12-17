import useSWR from "swr";
import { TransactionItem, PaymentRecord } from "../types";
import { useAuthStore } from "@/store/useAuthStore";

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  [key: string]: string | undefined;
}

// --- 1. Hook for Line Items History ---
export const useTransactionHistory = (
  page: number,
  pageSize: number,
  filters: TransactionFilters = {}
) => {
  const { isAuthenticated } = useAuthStore();

  return useSWR(
    isAuthenticated ? ["transaction-items", page, pageSize, filters] : null,
    async ([_, page, pageSize, filters]: [string, number, number, TransactionFilters]) => {
      const { getTransactionHistory } = await import("@/app/actions/transactions");
      const result = await getTransactionHistory(page, pageSize, filters);

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
      };
    },
    {
      keepPreviousData: true,
    }
  );
};

// --- 2. Hook for Payment/Header History ---
export const usePaymentHistory = (
  page: number = 1,
  pageSize: number = 50,
  filters: TransactionFilters = {}
) => {
  const { isAuthenticated } = useAuthStore();

  return useSWR(
    isAuthenticated ? ["payments", page, pageSize, filters] : null,
    async ([_, page, pageSize, filters]: [string, number, number, TransactionFilters]) => {
      const { getPaymentHistory } = await import("@/app/actions/transactions");
      const result = await getPaymentHistory(page, pageSize, filters);

      if (!result.success) {
        throw new Error(result.error);
      }

      const formattedData = (result.data as any[]).map((p) => ({
        transactionNo: p.invoice_no,
        transactionTime: new Date(p.transaction_time).toLocaleString(),
        customerName: p.customer_name,
        amountRendered: p.amount_rendered,
        voucher: p.voucher,
        grandTotal: p.grand_total,
        change: p.change,
      })) as PaymentRecord[];

      return {
        data: formattedData,
        count: result.count || 0,
      };
    },
    {
      keepPreviousData: true,
    }
  );
};