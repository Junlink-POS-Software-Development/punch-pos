"use client";

import React, { useEffect, useRef } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockFormSchema, StockFormSchema } from "./utils/types";
import { StockData } from "./lib/stocks.api";
import ItemAutoComplete from "@/utils/ItemAutoComplete";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";

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
  const { isSplit } = useViewStore();

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

  const {
    ref: rhfStockFlowRef,
    onChange: rhfStockFlowOnChange,
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

  const stockFlowRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const capitalPriceRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

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
      return;
    }

    if (e.key === "Enter") {
      const target = e.target as HTMLElement;
      if (submitButtonRef.current && target === submitButtonRef.current) {
        return;
      }
      e.preventDefault();
      const name = target.getAttribute("name");

      if (name === "itemName" || target.id === "itemName") {
        stockFlowRef.current?.focus();
        try { stockFlowRef.current?.showPicker(); } catch (err) {}
      } else if (name === "stockFlow" || target.id === "stockFlow") {
        quantityRef.current?.focus();
      } else if (name === "quantity" || target.id === "quantity") {
        capitalPriceRef.current?.focus();
      } else if (name === "capitalPrice" || target.id === "capitalPrice") {
        notesRef.current?.focus();
      } else if (name === "notes" || target.id === "notes") {
        submitButtonRef.current?.focus();
      }
    }
  };

  const gridLayoutClass = !isSplit
    ? "grid-cols-1"
    : "grid-cols-1 md:grid-cols-2";

  return (
    <form
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit(handleFormSubmit)}
      className={`
        overflow-y-auto w-full
        grid ${gridLayoutClass} 
        gap-4 md:gap-6 
        p-6
        transition-all duration-200
        ${
          itemToEdit
            ? "bg-blue-900/10 border-b border-blue-500/30"
            : ""
        }
      `}
    >
      {itemToEdit && (
        <div
          className={`flex justify-between items-center mb-2 pb-2 border-blue-500/30 border-b ${
            !isSplit ? "" : "md:col-span-2"
          }`}
        >
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
        <Controller
          name="itemName"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ItemAutoComplete
              {...field}
              disabled={!!itemToEdit}
              error={error?.message}
              className="w-full input-dark"
              onItemSelect={() => {
                stockFlowRef.current?.focus();
                try { stockFlowRef.current?.showPicker(); } catch (e) {}
              }}
            />
          )}
        />
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
          {...stockFlowRest}
          ref={(el) => {
            rhfStockFlowRef(el);
            stockFlowRef.current = el;
          }}
          onChange={(e) => {
            rhfStockFlowOnChange(e);
          }}
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
          {...quantityRest}
          ref={(el) => {
            rhfQuantityRef(el);
            quantityRef.current = el;
          }}
          className={`w-full input-dark ${
            errors.quantity ? "border-red-500" : ""
          }`}
          placeholder="0"
          onFocus={(e) => e.target.select()}
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
          {...capitalPriceRest}
          ref={(el) => {
            rhfCapitalPriceRef(el);
            capitalPriceRef.current = el;
          }}
          className={`w-full input-dark ${
            errors.capitalPrice ? "border-red-500" : ""
          }`}
          placeholder="0.00"
          onFocus={(e) => e.target.select()}
        />
        {errors.capitalPrice && (
          <p className="mt-1 text-red-300 text-sm">
            {errors.capitalPrice.message}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className={!isSplit ? "" : "md:col-span-2"}>
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

      {/* Buttons */}
      <div
        className={`flex justify-end gap-3 ${!isSplit ? "" : "md:col-span-2"}`}
      >
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