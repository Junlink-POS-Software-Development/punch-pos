import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../TerminalCart";

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

    console.log("3️⃣ [Logic] Sending RPC request to Supabase (via Server Action)...");

    const { processTransaction } = await import("@/app/actions/transactions");
    let rpcResult: any = null;

    // Retry logic for Timeout (3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        rpcResult = await withTimeout<any>(
          processTransaction(headerPayload, itemsPayload),
          20000, 
          "Transaction Save"
        );
        
        if (rpcResult.success) {
            break;
        } else {
            throw new Error(rpcResult.error);
        }

      } catch (err: any) {
        console.warn(`⚠️ [Logic] Attempt ${attempt} failed:`, err);
        if (attempt === 3) throw err; 
        await new Promise(res => setTimeout(res, 1000));
      }
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
            notes: `Auto-deduction: ${data.transactionNo}`,
          });
        }
      } catch (voucherError) {
        console.error("❌ [Logic] Voucher expense failed (non-fatal):", voucherError);
      }
    }

    return { ...headerPayload, transaction_time: new Date().toISOString() } as TransactionResult;
  } catch (err) {
    console.error("❌ [Logic] Crash in handleDone:", err);
    throw err;
  }
};