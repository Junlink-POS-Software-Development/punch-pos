// app/inventory/components/item-registration/hooks/useItemBatchUpload.ts

"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Papa from "papaparse";
import { Item, itemSchema } from "../../utils/itemTypes";
import { insertManyItems } from "../../lib/item.api";

// Define the shape of a CSV row error
export interface CsvError {
  row: number;
  message: string;
}

// 1. Create a Zod schema specifically for CSVs
// This handles string-to-number coercion for 'costPrice'
const csvItemSchema = itemSchema.extend({
  costPrice: z.preprocess(
    (val) => {
      // Coerce string to number
      const num = parseFloat(String(val));
      return isNaN(num) ? undefined : num;
    },
    // Use the same refinement as your original schema
    z.number().min(0, "Cost price must be zero or more").default(0)
  ),
  // Ensure optional fields have defaults so they don't fail validation if missing
  category: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

export const useItemBatchUpload = () => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [validItems, setValidItems] = useState<Item[]>([]);
  const [errors, setErrors] = useState<CsvError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Handle file selection and parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setValidItems([]);
    setErrors([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newValidItems: Item[] = [];
        const newErrors: CsvError[] = [];

        results.data.forEach((row, index) => {
          // Try to parse the row against our CSV schema
          const result = csvItemSchema.safeParse(row);

          if (result.success) {
            // Zod strips 'id' by default, which is good.
            newValidItems.push(result.data as Item);
          } else {
            // Collect validation errors
            const errorMessages = result.error.issues
              .map((e) => `${e.path.join(".")}: ${e.message}`)
              .join(", ");
            newErrors.push({
              row: index + 2, // +1 for 0-index, +1 for header
              message: errorMessages,
            });
          }
        });

        setValidItems(newValidItems);
        setErrors(newErrors);
        setIsParsing(false);
      },
      error: (error) => {
        console.error("PapaParse error:", error);
        setErrors([{ row: 0, message: `Parsing error: ${error.message}` }]);
        setIsParsing(false);
      },
    });
  };

  // 3. Handle the final submission
  const handleSubmit = async () => {
    if (validItems.length === 0) {
      alert("No valid items to upload.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await insertManyItems(validItems);
      alert("Batch upload successful!");
      queryClient.invalidateQueries({ queryKey: ["items"] });
      reset();
    } catch (error) {
      console.error("Batch insert error:", error);
      alert(`Batch upload failed: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Reset state
  const reset = () => {
    setFile(null);
    setValidItems([]);
    setErrors([]);
    setIsParsing(false);
    // This is a trick to clear the file input
    const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return {
    file,
    isParsing,
    isSubmitting,
    validItems,
    errors,
    handleFileChange,
    handleSubmit,
    reset,
  };
};
