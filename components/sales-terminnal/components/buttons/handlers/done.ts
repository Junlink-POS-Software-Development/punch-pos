"use server";

import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../terminal-cart/types";
import { processTransaction } from "@/app/actions/transactions";

// 1. Define the structure of the Server Action response
interface TransactionActionResponse {
  success: boolean;
  error?: string;
  data?: {
    invoice_no: string;
    payment_id: string;
  };
}

export type TransactionResult = {
  invoice_no: string;
  customer_name: string | null;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
  transaction_no: string;
  transaction_time: string;
  cashier_name: string;
  isOffline?: boolean;
} | null;

const withTimeout = <T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]) as Promise<T>;
};

export const handleDone = async (
  data: PosFormValues,
  cartItems: CartItem[],
  cashierId: string,
  customDate: Date | null,
  customerId: string | null
): Promise<TransactionResult> => {
  try {
    if (!cashierId) {
      throw new Error("User ID missing. Cannot process transaction.");
    }

    const transactionTime = customDate ? customDate.toISOString() : null;

    const headerPayload = {
      customer_name: data.customerName,
      amount_rendered: data.payment || 0,
      voucher: data.voucher || 0,
      grand_total: data.grandTotal,
      change: data.change,
      transaction_time: transactionTime,
      customer_id: customerId || null,
      cashier_name: cashierId,
    };

    const itemsPayload = cartItems.map((item) => ({
      sku: item.sku,
      item_name: item.itemName,
      sales_price: item.unitPrice,
      total_price: item.total,
      discount: item.discount || 0,
      quantity: item.quantity,
    }));

    // NOTE: Offline detection is handled CLIENT-SIDE in usePosForm.ts.
    // This server action should NEVER check navigator.onLine because
    // Node.js navigator.onLine is always undefined, making !navigator.onLine always true.

    let rpcResult: TransactionActionResponse | null = null;

    // Retry logic for Timeout (3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        rpcResult = await withTimeout<TransactionActionResponse>(
          processTransaction(headerPayload, itemsPayload),
          60000,
          "Transaction Save"
        );

        if (rpcResult.success) {
          break;
        } else {
          throw new Error(rpcResult.error || "Unknown RPC error");
        }
      } catch (err: unknown) {
        if (attempt === 3) {
          const isNetworkError = err instanceof Error && (
            err.message.includes("fetch") || 
            err.message.includes("network") || 
            err.message.includes("timed out")
          );

          if (isNetworkError) {
            const tempInvoiceNo = `OFF-${Date.now().toString().slice(-6)}`;
            return {
              invoice_no: tempInvoiceNo,
              customer_name: headerPayload.customer_name,
              amount_rendered: headerPayload.amount_rendered,
              voucher: headerPayload.voucher,
              grand_total: headerPayload.grand_total,
              change: headerPayload.change,
              transaction_no: tempInvoiceNo,
              transaction_time: transactionTime || new Date().toISOString(),
              cashier_name: headerPayload.cashier_name,
              isOffline: true,
            } as TransactionResult;
          }

          throw err;
        }
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    if (!rpcResult) {
       throw new Error("Transaction failed: No result from RPC");
    }

    const invoiceNo = rpcResult?.data?.invoice_no || "UNKNOWN";

    return {
      invoice_no: invoiceNo,
      customer_name: headerPayload.customer_name,
      amount_rendered: headerPayload.amount_rendered,
      voucher: headerPayload.voucher,
      grand_total: headerPayload.grand_total,
      change: headerPayload.change,
      transaction_no: invoiceNo,
      transaction_time: transactionTime || new Date().toISOString(),
      cashier_name: headerPayload.cashier_name,
    } as TransactionResult;
  } catch (err) {
    console.error("❌ [handleDone] Error:", err);
    throw err;
  }
};

