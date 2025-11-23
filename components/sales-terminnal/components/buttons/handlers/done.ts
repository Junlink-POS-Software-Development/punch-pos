// app/inventory/components/stock-management/buttons/done.ts
import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../TerminalCart";
import { supabase } from "@/lib/supabaseClient";

// Define the return type based on your headerPayload
export type TransactionResult = {
  invoice_no: string;
  customer_name: string | null; // Allow null for customer_name
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
  transaction_no: string;
  transaction_time: string;
  cashier_name: string;
} | null;

// Helper to prevent infinite hanging
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
  cartItems: CartItem[]
): Promise<TransactionResult> => {
  // <--- CHANGED RETURN TYPE
  console.log("--- 🛠 [Logic] handleDone started ---");

  try {
    console.log("1️⃣ [Logic] Checking Session (local)...");
    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    if (authError || !authData.session?.user) {
      console.error("❌ [Logic] Auth failed:", authError);
      alert("Session expired or invalid. Please log in again.");
      return null; // <--- Return null on failure
    }

    const cashierId = authData.session.user.id;

    console.log("2️⃣ [Logic] Preparing Payloads...");
    const headerPayload = {
      invoice_no: data.transactionNo,
      customer_name: data.customerName,
      amount_rendered: data.payment,
      voucher: data.voucher || 0,
      grand_total: data.grandTotal,
      change: data.change,
      transaction_no: data.transactionNo,
      transaction_time: new Date().toISOString(),
      cashier_name: cashierId,
    };

    const itemsPayload = cartItems.map((item) => ({
      sku: item.sku,
      item_name: item.itemName,
      cost_price: item.unitPrice,
      total_price: item.total,
      discount: item.discount || 0,
      quantity: item.quantity,
    }));

    console.log("3️⃣ [Logic] Sending RPC request to Supabase...");

    const { error } = await withTimeout(
      supabase.rpc("insert_new_payment_and_transaction", {
        header: headerPayload,
        items: itemsPayload,
      }),
      15000,
      "Transaction Save"
    );

    if (error) {
      console.error("❌ [Logic] RPC Error:", error.message);
      alert(`Transaction Failed: ${error.message}`);
      return null; // <--- Return null on failure
    }

    console.log("✅ [Logic] RPC Success! Transaction Saved.");

    // Return the payload to the UI for the Modal
    return headerPayload;
  } catch (err) {
    console.error("❌ [Logic] Unexpected Crash in handleDone:", err);
    alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    return null;
  }
};
