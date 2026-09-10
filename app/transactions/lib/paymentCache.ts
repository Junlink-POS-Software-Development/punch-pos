import { QueryClient, InfiniteData } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PaymentRecord as FormattedPaymentRecord } from "../types";

export const DEFAULT_PAYMENT_PAGE_SIZE = 50;

/**
 * Generates a unique, collision-resistant invoice number on the client.
 * Matches the format 'INV-YYYYMMDD-HHmmss-XXXX'.
 */
export function generateInvoiceNo(): string {
  const dateStr = dayjs().format("YYYYMMDD-HHmmss");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${dateStr}-${randomSuffix}`;
}

export interface PaymentInfinitePage {
  data: FormattedPaymentRecord[];
  count: number;
  nextPage?: number;
}

export interface RawPaymentInput {
  id?: string;
  invoice_no?: string | null;
  transaction_no?: string | null;
  transaction_time?: string | null;
  customer_name?: string | null;
  amount_rendered?: number | null;
  voucher?: number | null;
  grand_total?: number | null;
  amount_paid?: number | null;
  change?: number | null;
  cashier_id?: string | null;
}

/**
 * Maps raw database/RPC payment payload to typed FormattedPaymentRecord
 */
export function formatPaymentRecord(p: RawPaymentInput): FormattedPaymentRecord {
  return {
    id: p.id || p.invoice_no || p.transaction_no || `temp-${Date.now()}`,
    transactionNo: p.invoice_no || p.transaction_no || "N/A",
    transactionTime: p.transaction_time
      ? new Date(p.transaction_time).toLocaleString()
      : new Date().toLocaleString(),
    customerName: p.customer_name || "",
    amountRendered: p.amount_rendered ?? 0,
    voucher: p.voucher ?? 0,
    grandTotal: p.grand_total ?? p.amount_paid ?? 0,
    change: p.change ?? 0,
  };
}

/**
 * Optimistically prepends a new payment record to all matching ["payments"] infinite queries in cache.
 */
export function prependPaymentToQueryCache(
  queryClient: QueryClient,
  payment: FormattedPaymentRecord
) {
  queryClient.setQueriesData<InfiniteData<PaymentInfinitePage>>(
    { queryKey: ["payments"] },
    (oldData) => {
      if (!oldData || !oldData.pages || oldData.pages.length === 0) {
        return {
          pages: [
            {
              data: [payment],
              count: 1,
              nextPage: undefined,
            },
          ],
          pageParams: [1],
        };
      }

      // Prevent duplicate insertion if already in first page
      const firstPage = oldData.pages[0];
      const isAlreadyPresent = firstPage.data.some(
        (item) => item.id === payment.id || item.transactionNo === payment.transactionNo
      );

      if (isAlreadyPresent) {
        return oldData;
      }

      const updatedFirstPage: PaymentInfinitePage = {
        ...firstPage,
        data: [payment, ...firstPage.data],
        count: (firstPage.count || 0) + 1,
      };

      return {
        ...oldData,
        pages: [updatedFirstPage, ...oldData.pages.slice(1)],
      };
    }
  );
}

/**
 * Optimistically removes a deleted payment record from all matching ["payments"] infinite queries in cache.
 */
export function removePaymentFromQueryCache(
  queryClient: QueryClient,
  paymentId: string
) {
  queryClient.setQueriesData<InfiniteData<PaymentInfinitePage>>(
    { queryKey: ["payments"] },
    (oldData) => {
      if (!oldData || !oldData.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((item) => item.id !== paymentId),
          count: Math.max(0, (page.count || 0) - 1),
        })),
      };
    }
  );
}
