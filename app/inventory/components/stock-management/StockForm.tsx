"use client";

import React, { useEffect, useRef } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockFormSchema, StockFormSchema } from "./utils/types";
import { StockData } from "./lib/stocks.api";
import { ItemAutocomplete } from "@/utils/ItemAutoComplete";

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
    control,
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

  // --- (1) DESTRUCTURE 'onChange' FROM RHF's REGISTER ---
  const {
    ref: rhfStockFlowRef,
    onChange: rhfStockFlowOnChange, // <-- (FIX) Get RHF's onChange
    ...stockFlowRest
  } = register("stockFlow");

  const { ref: rhfQuantityRef, ...quantityRest } = register("quantity", {
    valueAsNumber: true,
  });
  const { ref: rhfCapitalPriceRef, ...capitalPriceRest } = register(
    "capitalPrice",
    { valueAsNumber: true }
  );
  const { ref: rhfNotesRef, ...notesRest } = register("notes");

  // Refs for focus management
  const stockFlowRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const capitalPriceRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // useEffect for resetting (no change)
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

  // handleFormSubmit (no change)
  const handleFormSubmit: SubmitHandler<StockFormSchema> = (data) => {
    onSubmit(data);
    if (!itemToEdit) reset();
  };

  // handleKeyDown (Updated)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      handleSubmit(handleFormSubmit)();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const target = e.target as HTMLElement;

      // --- (2) REMOVE 'stockFlow' LOGIC FROM HERE ---
      // This allows 'Enter' to be used for confirming the select
      if (target.id === "stockFlow") {
        return; // Do nothing, let the onChange event handle it
      }
      // --- (END FIX) ---

      if (target.id === "quantity") {
        capitalPriceRef.current?.focus();
      } else if (target.id === "capitalPrice") {
        notesRef.current?.focus();
      } else if (target.id === "notes") {
        submitButtonRef.current?.focus();
      }
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
      {/* Editing banner (no change) */}
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

      {/* Item Name (no change) */}
      <div>
        <label
          htmlFor="itemName"
          className="block mb-1 font-medium text-slate-300 text-sm"
        >
          Item Name
        </label>
        <Controller
          name="itemName"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ItemAutocomplete
              {...field}
              disabled={!!itemToEdit}
              error={error?.message}
              className="w-full input-dark"
              onItemSelect={() => {
                stockFlowRef.current?.focus();
              }}
            />
          )}
        />
      </div>

      {/* Stock Flow (Updated) */}
      <div>
        <label
          htmlFor="stockFlow"
          className="block mb-1 font-medium text-slate-300 text-sm"
        >
          Stock Flow
        </label>
        <select
          id="stockFlow"
          {...stockFlowRest} // Use the rest props (name, onBlur)
          ref={(el) => {
            rhfStockFlowRef(el);
            stockFlowRef.current = el;
          }}
          // --- (3) ADD CUSTOM 'onChange' HANDLER ---
          onChange={(e) => {
            rhfStockFlowOnChange(e); // Call RHF's onChange
            quantityRef.current?.focus(); // Jump to next field
          }}
          // --- (END FIX) ---
          className={`w-full input-dark ${
            errors.stockFlow ? "border-red-500" : ""
          }`}
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

      {/* Quantity (no change) */}
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
          {...quantityRest}
          ref={(el) => {
            rhfQuantityRef(el);
            quantityRef.current = el;
          }}
          className={`w-full input-dark ${
            errors.quantity ? "border-red-500" : ""
          }`}
          placeholder="0"
        />
        {errors.quantity && (
          <p className="mt-1 text-red-300 text-sm">{errors.quantity.message}</p>
        )}
      </div>

      {/* Capital Price (no change) */}
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
          {...capitalPriceRest}
          ref={(el) => {
            rhfCapitalPriceRef(el);
            capitalPriceRef.current = el;
          }}
          className={`w-full input-dark ${
            errors.capitalPrice ? "border-red-500" : ""
          }`}
          placeholder="0.00"
        />
        {errors.capitalPrice && (
          <p className="mt-1 text-red-300 text-sm">
            {errors.capitalPrice.message}
          </p>
        )}
      </div>

      {/* Notes (no change) */}
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
          {...notesRest}
          ref={(el) => {
            rhfNotesRef(el);
            notesRef.current = el;
          }}
          className={`w-full input-dark ${
            errors.notes ? "border-red-500" : ""
          }`}
          placeholder="Description..."
        ></textarea>
      </div>

      {/* Buttons (no change) */}
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
          ref={submitButtonRef}
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
