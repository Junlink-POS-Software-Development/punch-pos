import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../TerminalCart";
import { supabase } from "@/lib/supabaseClient";

// Helper to prevent infinite hanging
const withTimeout = <T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise), // Ensure it's a proper Promise
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
): Promise<boolean> => {
  console.log("--- 🛠 [Logic] handleDone started ---");

  try {
    // STEP 1: AUTH (Changed to getSession for speed)
    console.log("1️⃣ [Logic] Checking Session (local)...");
    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    // Note: getSession returns data.session.user
    if (authError || !authData.session?.user) {
      console.error("❌ [Logic] Auth failed:", authError);
      alert("Session expired or invalid. Please log in again.");
      return false;
    }

    const cashierId = authData.session.user.id;
    console.log("✅ [Logic] Session Valid. User ID:", cashierId);

    // STEP 2: PREPARE HEADER
    console.log("2️⃣ [Logic] Preparing Payloads...");
    const headerPayload = {
      invoice_no: data.transactionNo,
      customer_name: data.customerName, // Fixed: 'costumer' -> 'customer'
      amount_rendered: data.payment,
      voucher: data.voucher || 0,
      grand_total: data.grandTotal,
      change: data.change,
      transaction_no: data.transactionNo,
      transaction_time: new Date().toISOString(),
      cashier_name: cashierId,
    };

    // STEP 3: PREPARE ITEMS
    const itemsPayload = cartItems.map((item) => ({
      sku: item.sku,
      item_name: item.itemName,
      cost_price: item.unitPrice,
      total_price: item.total,
      discount: item.discount || 0,
      quantity: item.quantity,
    }));

    // *** DEBUG LOG: Check your browser console for this object ***
    console.log("📦 [Logic] Payload to send:", {
      header: headerPayload,
      items: itemsPayload,
    });

    // STEP 4: EXECUTE RPC (Timeout after 15s)
    console.log("3️⃣ [Logic] Sending RPC request to Supabase...");

    const { error } = await withTimeout(
      supabase.rpc("insert_new_payment_and_transaction", {
        header: headerPayload,
        items: itemsPayload,
      }),
      15000, // Increased timeout slightly for debugging
      "Transaction Save"
    );

    if (error) {
      console.error(
        "❌ [Logic] RPC Error:",
        error.message,
        error.details,
        error.hint
      );
      alert(`Transaction Failed: ${error.message}`);
      return false;
    }

    console.log("✅ [Logic] RPC Success! Transaction Saved.");
    return true;
  } catch (err) {
    console.error("❌ [Logic] Unexpected Crash in handleDone:", err);
    alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    return false;
  }
};
