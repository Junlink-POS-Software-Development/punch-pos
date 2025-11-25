// app/inventory/components/stock-management/utils/posSchema.ts
import { z } from "zod";

const pesoFormat = z.number().min(0, "Value must be positive");

// Helper to generate a random transaction number
// Helper to generate a random transaction number
export const generateTransactionNo = () => {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `TRX-${timestamp}-${randomPart}`;
};

export const posSchema = z.object({
  payment: pesoFormat,
  // Use nullable instead of optional so it's always part of the type
  customerName: z.string().nullable(),
  transactionNo: z.string(),
  voucher: pesoFormat,
  barcode: z.string(),
  grandTotal: z.number(),
  quantity: z.number().int().min(0),
  discount: pesoFormat,
  change: z.number(),
});

export type PosFormValues = z.infer<typeof posSchema>;

export const getDefaultFormValues = (): PosFormValues => ({
  payment: 0.0,
  // Explicitly set to null to satisfy string | null
  customerName: null,
  transactionNo: generateTransactionNo(),
  voucher: 0.0,
  barcode: "",
  grandTotal: 0,
  quantity: 0,
  discount: 0.0,
  change: 0,
});
