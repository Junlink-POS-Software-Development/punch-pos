// components/type.ts

import { z } from "zod";

/**
 * The Zod schema for validating the stock form.
 * This is used by the resolver for runtime validation.
 */
export const stockFormSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  stockFlow: z.enum(["stock-in", "stock-out"], {
    message: "Please select a stock flow.",
  }),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  capitalPrice: z
    .number()
    .positive("Price must be a positive number")
    .min(0.01, "Price must be at least 0.01"),
  notes: z.string().optional(),
});

/**
 * The inferred TypeScript type from the schema.
 * This is used for static type-checking in useForm, props, and state.
 */
export type StockFormSchema = z.infer<typeof stockFormSchema>;
