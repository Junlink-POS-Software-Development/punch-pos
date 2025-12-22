// app/inventory/components/stock-management/utils/posSchema.ts
import { z } from "zod";

const pesoFormat = z
  .union([z.number(), z.nan()])
  .transform((val) => (isNaN(val) ? 0 : val))
  .refine((val) => val >= 0, "Value must be positive");

// Helper to generate a random transaction number
// Helper to generate a random transaction number
export const generateTransactionNo = () => {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `TRX-${timestamp}-${randomPart}`;
};

export const posSchema = z.object({
  payment: pesoFormat.nullable(),
  // Use nullable instead of optional so it's always part of the type
  customerName: z.string().nullable(),
  transactionNo: z.string(),
  voucher: pesoFormat.nullable(),
  barcode: z.string(),
  grandTotal: z.number(),
  quantity: z.number().int().min(0).nullable(),
  discount: pesoFormat.nullable(),
  change: z.number(),
});

export type PosFormValues = z.infer<typeof posSchema>;

export const getDefaultFormValues = (): PosFormValues => ({
  payment: null,
  // Explicitly set to null to satisfy string | null
  customerName: null,
  transactionNo: generateTransactionNo(),
  voucher: null,
  barcode: "",
  grandTotal: 0,
  quantity: null,
  discount: null,
  change: 0,
});
