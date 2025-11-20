import { PosFormValues } from "@/components/sales-terminnal/utils/posSchema";
import { CartItem } from "../../TerminalCart";

export const handleDone = async (
  data: PosFormValues,
  cartItems: CartItem[]
): Promise<boolean> => {
  console.log("--- [done.ts] Executing handleDone ---");

  // 1. Construct the 'transactions' data set from the cart
  const transactions = cartItems.map((item) => ({
    barcode: item.sku,
    ItemName: item.itemName,
    unitPrice: item.unitPrice,
    discount: item.discount || 0, // Handle undefined discount safely
    quantity: item.quantity,
    totalPrice: item.total,
  }));

  // 2. Construct the 'paymentInfo' data set from the form data
  const paymentInfo = {
    costumerName: data.customerName,
    "Amount Rendered": data.payment,
    Voucher: data.voucher,
    grandTotal: data.grandTotal,
    Change: data.change,
    transactionNo: data.transactionNo,
    transactionTime: new Date().toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };

  // 3. Log the requested data
  console.log("Transactions:", transactions);
  console.log("PaymentInfo:", paymentInfo);

  // 4. TODO: Insert API/Database logic here
  // await supabase.from('sales').insert(...)

  console.log("--- [done.ts] Finished processing ---");

  // 5. Return TRUE to signal SalesTerminal to reset the UI
  return true;
};
