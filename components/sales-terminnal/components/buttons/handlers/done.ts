import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../TerminalCart";
import { supabase } from "@/lib/supabaseClient";

export type TransactionResult = {
  invoice_no: string;
  customer_name: string | null;
  amount_rendered: number;
  voucher: number;
  grand_total: number;
  change: number;
  transaction_no: string;
  // transaction_time: string; // Removed from return type as it is now DB generated
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
  cashierId: string 
): Promise<TransactionResult> => {
  console.log("--- 🛠 [Logic] handleDone started ---");

  try {
    if (!cashierId) {
       throw new Error("User ID missing. Cannot process transaction.");
    }

    console.log("2️⃣ [Logic] Preparing Payloads...");
    
    const headerPayload = {
      invoice_no: data.transactionNo,
      customer_name: data.customerName,
      amount_rendered: data.payment,
      voucher: data.voucher || 0,
      grand_total: data.grandTotal,
      change: data.change,
      transaction_no: data.transactionNo,
      // REMOVED: transaction_time: new Date().toISOString(), 
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
      if (error.message.includes("duplicate key value") || error.message.includes("payments_pkey")) {
        console.warn("⚠️ [Logic] Duplicate Key Error detected. Checking for existing transaction...");
        
        const { data: existingPayment, error: fetchError } = await supabase
          .from("payments")
          .select("invoice_no, grand_total")
          .eq("invoice_no", data.transactionNo)
          .single();

        if (existingPayment && !fetchError) {
           if (Math.abs(existingPayment.grand_total - data.grandTotal) < 0.01) {
             console.log("✅ [Logic] Transaction already exists and matches. Treating as success.");
             // Note: headerPayload no longer has transaction_time, which matches our new logic
             return headerPayload as TransactionResult; 
           } else {
             console.error("❌ [Logic] Duplicate ID found but amounts do not match.");
             throw new Error("Transaction ID collision detected. Please refresh.");
           }
        }
      }
      console.error("❌ [Logic] RPC Error:", error.message);
      throw new Error(`Transaction Failed: ${error.message}`);
    }

    console.log("✅ [Logic] RPC Success! Transaction Saved.");

    // --- VOUCHER AUTOMATION ---
    if (data.voucher && data.voucher > 0) {
      try {
        console.log("🎫 [Logic] Processing Voucher Deduction...");
        const { fetchCategories } = await import("@/app/inventory/components/item-registration/lib/categories.api");
        const { createExpense } = await import("@/app/expenses/lib/expenses.api");

        const categories = await fetchCategories();
        const defaultSource = categories.find(c => c.is_default_voucher_source);

        if (defaultSource) {
          await createExpense({
            transaction_date: new Date().toISOString().split('T')[0],
            source: defaultSource.category,
            classification: "Voucher Deduction",
            amount: Number(data.voucher),
            receipt_no: data.transactionNo,
            notes: `Automatic deduction for voucher usage. Transaction: ${data.transactionNo}`,
          });
        }
      } catch (voucherError) {
        console.error("❌ [Logic] Failed to record voucher expense:", voucherError);
      }
    }

    return headerPayload as TransactionResult;
  } catch (err) {
    console.error("❌ [Logic] Unexpected Crash in handleDone:", err);
    throw err;
  }
};