// itemTypes.ts

import { z } from "zod";

// 1. Define and export the Zod schema
export const itemSchema = z.object({
  // --- ADDED ID FIELD ---
  // The 'id' is required for state management (editing/deleting)
  // after the item is registered and fetched from the DB.
  id: z.string().uuid().optional(),
  // ----------------------

  itemName: z.string().min(1, "Item name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().optional(),

  // The fixed costPrice validation is retained
  costPrice: z
    .number()
    .refine((val) => !isNaN(val), {
      message: "Cost price must be a number",
    })
    .pipe(z.number().min(0, "Cost price must be zero or more")),

  description: z.string().optional(),
  
  lowStockThreshold: z
    .number()
    .min(0, "Threshold must be zero or more")
    .optional()
    .nullable(),
  categoryName: z.string().optional(),
});

// 2. Export the inferred Item type
export type Item = z.infer<typeof itemSchema>;

// 3. Export the default values for the form
export const defaultItemValues: Item = {
  // --- DEFAULT ID IS UNDEFINED ---
  id: undefined,
  // -----------------------------
  itemName: "",
  sku: "",
  category: "",
  costPrice: 0.0,
  description: "",
  lowStockThreshold: null,
  categoryName: "",
};
