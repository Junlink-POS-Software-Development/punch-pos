// app/inventory/components/item-registration/SingleItemRegistry.tsx

"use client";

import React, { useEffect } from "react";
import { Controller } from "react-hook-form";
import { XCircle } from "lucide-react";
import { Item } from "../utils/itemTypes";
import { useItemForm } from "./hooks/useItemForm";
import { CategorySelect } from "../utils/CategorySelect";
import { useSettingsStore } from "@/store/useSettingsStore";

interface SingleItemRegistryProps {
  itemToEdit?: Item;
  onFormSubmit: (data: Item) => void;
  onCancelEdit: () => void;
}

export const SingleItemRegistry: React.FC<SingleItemRegistryProps> = ({
  itemToEdit,
  onFormSubmit,
  onCancelEdit,
}) => {
  const { lowStockThreshold: globalThreshold } = useSettingsStore();

  const {
    isEditing,
    register,
    control,
    handleRHFSubmit,
    handleKeyDown,
    errors,
    isSubmitting,
    onCancelEdit: onCancelEditFromHook,
    setValue,
  } = useItemForm({
    itemToEdit,
    onFormSubmit,
    onCancelEdit,
  });

  // Pre-fill threshold for new items
  useEffect(() => {
    if (!isEditing && !itemToEdit) {
      setValue("lowStockThreshold", globalThreshold);
    }
  }, [globalThreshold, isEditing, itemToEdit, setValue]);

  return (
    <div className="relative p-6 h-full glass-effect">
      <h3 className="mb-4 font-bold text-lg text-white tracking-tight uppercase font-lexend">
        {isEditing ? "Edit Item" : "Register New Item"}
      </h3>
      
      <form
        onSubmit={handleRHFSubmit}
        onKeyDown={handleKeyDown}
        className="gap-x-6 gap-y-2 grid grid-cols-1 md:grid-cols-2"
      >
        {/* Item Name */}
        <div className="relative pb-5">
          <label htmlFor="itemName" className="block mb-2 font-medium text-slate-300 text-sm">
            Item Name
          </label>
          <input
            type="text"
            className={`w-full input-dark ${errors.itemName ? "border-red-500 text-red-200" : ""}`}
            placeholder="e.g. Organic Milk"
            {...register("itemName")}
          />
          {errors.itemName && (
            <p className="bottom-0 absolute text-red-400 text-xs">{errors.itemName.message}</p>
          )}
        </div>

        {/* SKU */}
        <div className="relative pb-5">
          <label htmlFor="sku" className="block mb-2 font-medium text-slate-300 text-sm">
            SKU / Barcode
          </label>
          <input
            type="text"
            className={`w-full input-dark ${errors.sku ? "border-red-500 text-red-200" : ""}`}
            placeholder="Scan or type SKU"
            {...register("sku")}
          />
          {errors.sku && (
            <p className="bottom-0 absolute text-red-400 text-xs">{errors.sku.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="relative pb-5">
          <label htmlFor="category" className="block mb-2 font-medium text-slate-300 text-sm">
            Category
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <CategorySelect
                value={field.value}
                onChange={field.onChange}
                error={errors.category?.message}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        {/* Cost Price */}
        <div className="relative pb-5">
          <label htmlFor="costPrice" className="block mb-2 font-medium text-slate-300 text-sm">
            Cost Price (₱)
          </label>
          <input
            type="number"
            step="0.01"
            className={`w-full input-dark ${errors.costPrice ? "border-red-500 text-red-200" : ""}`}
            placeholder="0.00"
            {...register("costPrice", { valueAsNumber: true })}
          />
          {errors.costPrice && (
            <p className="bottom-0 absolute text-red-400 text-xs">{errors.costPrice.message}</p>
          )}
        </div>

        {/* Low Stock Threshold */}
        <div className="relative pb-5">
          <label htmlFor="lowStockThreshold" className="block mb-2 font-medium text-slate-300 text-sm">
            Low Stock Threshold
          </label>
          <input
            type="number"
            min="0"
            className={`w-full input-dark ${errors.lowStockThreshold ? "border-red-500 text-red-200" : ""}`}
            placeholder="Global setting used if empty"
            {...register("lowStockThreshold", { valueAsNumber: true })}
          />
          {errors.lowStockThreshold && (
            <p className="bottom-0 absolute text-red-400 text-xs">
              {errors.lowStockThreshold.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2 relative pb-5">
          <label htmlFor="description" className="block mb-2 font-medium text-slate-300 text-sm">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Additional item details..."
            className="w-full input-dark resize-none h-20"
            {...register("description")}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 md:col-span-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEditFromHook}
              className="flex items-center gap-2 bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30 btn-3d-glass"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600/30 hover:bg-blue-600/40 border-blue-600/50 btn-3d-glass min-w-[160px] justify-center"
          >
            {isSubmitting ? (
              <div className="border-white border-t-2 border-r-2 rounded-full w-4 h-4 animate-spin"></div>
            ) : isEditing ? (
              "Update Item"
            ) : (
              "Register Item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};