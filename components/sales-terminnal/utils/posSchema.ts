// app/inventory/components/stock-management/utils/posSchema.ts
import { z } from "zod";
// Removed dayjs import

const pesoFormat = z.number().min(0, "Value must be positive");

// Helper to generate a random transaction number
export const generateTransactionNo = () => {
  const randomPart1 = Math.floor(10000 + Math.random() * 90000);
  const randomPart2 = Math.floor(10 + Math.random() * 90);
  return `ABC-${randomPart1}-D${randomPart2}`;
};

export const posSchema = z.object({
  cashierName: z.string(),
  transactionTime: z.string(),
  payment: pesoFormat,

  // ✅ Use nullable instead of optional so it's always part of the type
  customerName: z.string().nullable(),

  transactionNo: z.string(),
  voucher: pesoFormat,
  barcode: z.string(),
  availableStocks: z.number(),
  grandTotal: z.number(),
  quantity: z.number().int().min(0),
  discount: pesoFormat,
  change: z.number(),
});

export type PosFormValues = z.infer<typeof posSchema>;

// Get the correct locale-formatted time
const getFormattedTime = () =>
  new Date()
    .toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/,/, ""); // Match the format used in usePosForm

export const getDefaultFormValues = (): PosFormValues => ({
  cashierName: "Junel Fuentes",
  transactionTime: getFormattedTime(), // <-- Live time format
  payment: 0.0,

  // ✅ Explicitly set to null to satisfy string | null
  customerName: null,

  transactionNo: generateTransactionNo(),
  voucher: 0.0,
  barcode: "",
  availableStocks: 0, // <-- REVISED: Initial value set to 0
  grandTotal: 0, // <-- REVISED: Initial value set to 0
  quantity: 0,
  discount: 0.0,
  change: 0, // <-- REVISED: Initial value set to 0
});
