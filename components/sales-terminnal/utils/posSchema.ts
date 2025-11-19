// app/inventory/components/stock-management/utils/posSchema.ts
import { z } from "zod";
import dayjs from "dayjs";

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
  quantity: z.number().int().min(0), // <--- CHANGE THIS LINE (from min(1) to min(0))
  discount: pesoFormat,
  change: z.number(),
});

export type PosFormValues = z.infer<typeof posSchema>;

export const getDefaultFormValues = (): PosFormValues => ({
  cashierName: "Junel Fuentes",
  transactionTime: dayjs().format("MM/DD/YYYY hh:mm:ss"),
  payment: 0.0,

  // ✅ Explicitly set to null to satisfy string | null
  customerName: null,

  transactionNo: generateTransactionNo(),
  voucher: 0.0,
  barcode: "",
  availableStocks: 21,
  grandTotal: 12312,
  quantity: 0,
  discount: 0.0,
  change: 54321,
});
