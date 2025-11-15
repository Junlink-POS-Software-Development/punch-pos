// components/StockForm.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// 1. Import the schema and type from the new file
import { stockFormSchema, StockFormSchema } from "./utils/types";

// 2. Schema and type definitions are removed from this file

// 3. Props now use the imported type
interface StockFormProps {
  onSubmit: SubmitHandler<StockFormSchema>;
}

export function StockForm({ onSubmit }: StockFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StockFormSchema>({
    // 4. useForm uses the imported type
    resolver: zodResolver(stockFormSchema), // 5. Resolver uses the imported schema
    defaultValues: {
      itemName: "",
      stockFlow: undefined,
      notes: "",
    },
  });

  const handleFormSubmit: SubmitHandler<StockFormSchema> = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="gap-x-6 gap-y-8 grid grid-cols-1 md:grid-cols-2 bg-slate-900 shadow-lg p-6 rounded-lg"
    >
      {/* Item Name */}
      <div>
        <label
          htmlFor="itemName"
          className="block mb-1 font-medium text-slate-300 text-sm"
        >
          Item Name
        </label>
        <input
          id="itemName"
          type="text"
          className={`w-full input-dark ${
            errors.itemName ? "border-red-500" : ""
          }`}
          placeholder="e.g., 'Product A'"
          {...register("itemName")}
        />
        {errors.itemName && (
          <p className="mt-1 text-red-300 text-sm">{errors.itemName.message}</p>
        )}
      </div>

      {/* Stock Flow */}
      <div>
        <label
          htmlFor="stockFlow"
          className="block mb-1 font-medium text-slate-300 text-sm"
        >
          Stock Flow
        </label>
        <select
          id="stockFlow"
          className={`w-full input-dark ${
            errors.stockFlow ? "border-red-500" : ""
          }`}
          {...register("stockFlow")}
        >
          <option value="">Select flow...</option>
          <option value="stock-in">Stock In</option>
          <option value="stock-out">Stock Out</option>
        </select>
        {errors.stockFlow && (
          <p className="mt-1 text-red-300 text-sm">
            {errors.stockFlow.message}
          </p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor="quantity"
          className="block mb-1 font-medium text-slate-300 text-sm"
        >
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          className={`w-full input-dark ${
            errors.quantity ? "border-red-500" : ""
          }`}
          placeholder="0"
          {...register("quantity", { valueAsNumber: true })}
        />
        {errors.quantity && (
          <p className="mt-1 text-red-300 text-sm">{errors.quantity.message}</p>
        )}
      </div>

      {/* Capital Price */}
      <div>
        <label
          htmlFor="capitalPrice"
          className="block mb-1 font-medium text-slate-300 text-sm"
        >
          Capital Price (per item)
        </label>
        <input
          id="capitalPrice"
          type="number"
          step="0.01"
          className={`w-full input-dark ${
            errors.capitalPrice ? "border-red-500" : ""
          }`}
          placeholder="0.00"
          {...register("capitalPrice", { valueAsNumber: true })}
        />
        {errors.capitalPrice && (
          <p className="mt-1 text-red-300 text-sm">
            {errors.capitalPrice.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <label
          htmlFor="notes"
          className="block mb-1 font-medium text-slate-300 text-sm"
        >
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          className={`w-full input-dark ${
            errors.notes ? "border-red-500" : ""
          }`}
          placeholder="A brief description..."
          {...register("notes")}
        ></textarea>
        {errors.notes && (
          <p className="mt-1 text-red-300 text-sm">{errors.notes.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end md:col-span-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 px-4 py-2 border border-green-500/50 rounded-md btn-3d-glass"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
          ) : (
            "Submit Entry"
          )}
        </button>
      </div>
    </form>
  );
}
