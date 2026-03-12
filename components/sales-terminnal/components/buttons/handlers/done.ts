"use server";

import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../terminal-cart/types";
import { processTransaction } from "@/app/actions/transactions";
import { useOfflineQueueStore } from "@/store/useOfflineQueueStore";
import { QueryClient } from "@tanstack/react-query";
import { DashboardStats } from "@/app/dashboard/lib/dashboardMockData";

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
  customerId: string | null,
  queryClient?: QueryClient // <--- [NEW] Optional queryClient for optimistic updates
): Promise<TransactionResult> => {
  console.log("--- 🛠 [Server Action] handleDone started ---");

  try {
    if (!cashierId) {
      throw new Error("User ID missing. Cannot process transaction.");
    }

    console.log("2️⃣ [Logic] Preparing Payloads...");

    // [NEW] Format date if exists
    const transactionTime = customDate ? customDate.toISOString() : null;

    const headerPayload = {
      // invoice_no is NOT sent - backend generates it
      // transaction_no is NOT sent - backend may handle it
      customer_name: data.customerName,
      amount_rendered: data.payment || 0,
      voucher: data.voucher || 0,
      grand_total: data.grandTotal,
      change: data.change,
      transaction_time: transactionTime,
      customer_id: customerId || null,
      cashier_name: cashierId, // Use cashierId as cashier identifier
    };

    const itemsPayload = cartItems.map((item) => ({
      sku: item.sku,
      item_name: item.itemName,
      sales_price: item.unitPrice,
      total_price: item.total,
      discount: item.discount || 0,
      quantity: item.quantity,
    }));

    console.log(
      "3️⃣ [Logic] Sending RPC request to Supabase (via Server Action)..."
    );

    // [OFFLINE MODE INTERCEPT]
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      console.log("📶 [Offline Mode] Device is offline. Queueing transaction.");
      
      const tempInvoiceNo = `OFF-${Date.now().toString().slice(-6)}`;
      
      // Enqueue the transaction
      useOfflineQueueStore.getState().enqueue({
        type: "transaction",
        payload: { headerPayload, itemsPayload }
      });

      // [OPTIMISTIC DASHBOARD UPDATE]
      if (queryClient) {
        const todayStr = (customDate || new Date()).toISOString().split("T")[0];
        queryClient.setQueryData<DashboardStats>(["dashboard-stats", todayStr], (old) => {
          if (!old) return old;
          
          return {
            ...old,
            grossSales: old.grossSales + headerPayload.grand_total,
            netSales: old.netSales + headerPayload.grand_total,
            cashInDrawer: old.cashInDrawer + headerPayload.amount_rendered, // Simplified assumption
            netProfit: old.netProfit + headerPayload.grand_total, // Simplified, missing real COGS offline
          };
        });
        
        // Optimistic refresh for transaction list if looking at it
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }

      console.log("✅ [Logic] Transaction queued offline successfully!");

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
      } as TransactionResult;
    }

    // 2. Replace 'any' with the specific interface
    let rpcResult: TransactionActionResponse | null = null;

    // Retry logic for Timeout (3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // 3. Pass the type to the generic function
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

        // 4. Handle error safely without 'any'
      } catch (err: unknown) {
        console.warn(`⚠️ [Logic] Attempt ${attempt} failed:`, err);

        if (attempt === 3) {
          // [OFFLINE FALLBACK] If all 3 attempts fail, assume offline/network issue
          console.log("📶 [Offline Mode] Network failed after 3 attempts. Queueing transaction.");
          const tempInvoiceNo = `OFF-${Date.now().toString().slice(-6)}`;
          
          useOfflineQueueStore.getState().enqueue({
            type: "transaction",
            payload: { headerPayload, itemsPayload }
          });

          // [OPTIMISTIC DASHBOARD UPDATE - FALLBACK]
          if (queryClient) {
            const todayStr = (customDate || new Date()).toISOString().split("T")[0];
            queryClient.setQueryData<DashboardStats>(["dashboard-stats", todayStr], (old) => {
              if (!old) return old;
              return {
                ...old,
                grossSales: old.grossSales + headerPayload.grand_total,
                netSales: old.netSales + headerPayload.grand_total,
                cashInDrawer: old.cashInDrawer + headerPayload.amount_rendered, 
                netProfit: old.netProfit + headerPayload.grand_total, 
              };
            });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          }

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
          } as TransactionResult;
        }
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    if (!rpcResult) {
       throw new Error("Transaction failed: No result from RPC");
    }

    console.log("✅ [Logic] Transaction Saved Successfully!");

    // Extract invoice_no from backend response
    const invoiceNo = rpcResult?.data?.invoice_no || "UNKNOWN";

    return {
      invoice_no: invoiceNo,
      customer_name: headerPayload.customer_name,
      amount_rendered: headerPayload.amount_rendered,
      voucher: headerPayload.voucher,
      grand_total: headerPayload.grand_total,
      change: headerPayload.change,
      transaction_no: invoiceNo, // Use invoice_no as transaction_no
      transaction_time: transactionTime || new Date().toISOString(),
      cashier_name: headerPayload.cashier_name,
    } as TransactionResult;
  } catch (err) {
    console.error("❌ [Logic] Crash in handleDone:", err);
    throw err;
  }
};
