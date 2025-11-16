"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockFormSchema, StockFormSchema } from "./utils/types";
import { StockData } from "./lib/stocks.api";

interface StockFormProps {
  onSubmit: SubmitHandler<StockFormSchema>;
  itemToEdit?: StockData | null;
  onCancelEdit?: () => void;
}

export function StockForm({
  onSubmit,
  itemToEdit,
  onCancelEdit,
}: StockFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm<StockFormSchema>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      itemName: "",
      stockFlow: undefined,
      notes: "",
      quantity: 0,
      capitalPrice: 0,
    },
  });

  useEffect(() => {
    if (itemToEdit) {
      reset({
        itemName: itemToEdit.item_name || "",
        stockFlow: itemToEdit.flow as "stock-in" | "stock-out",
        quantity: itemToEdit.quantity,
        capitalPrice: itemToEdit.capital_price,
        notes: itemToEdit.notes || "",
      });
      setTimeout(() => setFocus("stockFlow"), 100);
    } else {
      reset({
        itemName: "",
        stockFlow: undefined,
        notes: "",
        quantity: 0,
        capitalPrice: 0,
      });
    }
  }, [itemToEdit, reset, setFocus]);

  const handleFormSubmit: SubmitHandler<StockFormSchema> = (data) => {
    onSubmit(data);
    if (!itemToEdit) reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };

  return (
    <form
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit(handleFormSubmit)}
      className={`gap-x-6 gap-y-8 grid grid-cols-1 md:grid-cols-2 shadow-lg p-6 rounded-lg transition-colors ${
        itemToEdit ? "bg-blue-900/20 border border-blue-500/30" : "bg-slate-900"
      }`}
    >
      {itemToEdit && (
        <div className="flex justify-between items-center md:col-span-2 mb-2 pb-2 border-blue-500/30 border-b">
          <h3 className="font-semibold text-blue-200 text-sm">
            ✏️ Editing Record
          </h3>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-slate-400 hover:text-white text-xs"
          >
            Cancel
          </button>
        </div>
      )}

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
          disabled={!!itemToEdit}
          className={`w-full input-dark ${
            itemToEdit ? "opacity-50 cursor-not-allowed text-slate-500" : ""
          } ${errors.itemName ? "border-red-500" : ""}`}
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
          Capital Price
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
          placeholder="Description..."
          {...register("notes")}
        ></textarea>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 md:col-span-2">
        {itemToEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 text-slate-300 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`flex items-center gap-2 px-4 py-2 border rounded-md btn-3d-glass transition-all ${
            itemToEdit
              ? "bg-blue-500/30 hover:bg-blue-500/40 border-blue-500/50"
              : "bg-green-500/30 hover:bg-green-500/40 border-green-500/50"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
          ) : itemToEdit ? (
            "Update Entry"
          ) : (
            "Submit Entry"
          )}
        </button>
      </div>
    </form>
  );
}
