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
    <div className="bg-slate-900 shadow-lg p-4 rounded-lg h-full">
      <h3 className="mb-4 font-semibold text-lg text-slate-100">
        {isEditing ? "Edit Item" : "Single Registration"}
      </h3>
      
      <form
        onSubmit={handleRHFSubmit}
        onKeyDown={handleKeyDown}
        className="gap-6 grid grid-cols-1 md:grid-cols-2"
      >
        {/* Item Name */}
        <div className="relative pb-5">
          <label htmlFor="itemName" className="block mb-2 font-medium text-slate-300 text-sm">
            Item Name
          </label>
          <input
            type="text"
            className={`w-full input-dark ${errors.itemName ? "border-red-500" : ""}`}
            {...register("itemName")}
          />
          {errors.itemName && (
            <p className="bottom-0 absolute text-red-300 text-sm">{errors.itemName.message}</p>
          )}
        </div>

        {/* SKU */}
        <div className="relative pb-5">
          <label htmlFor="sku" className="block mb-2 font-medium text-slate-300 text-sm">
            SKU / Barcode
          </label>
          <input
            type="text"
            className={`w-full input-dark ${errors.sku ? "border-red-500" : ""}`}
            {...register("sku")}
          />
          {errors.sku && (
            <p className="bottom-0 absolute text-red-300 text-sm">{errors.sku.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
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
            className={`w-full input-dark ${errors.costPrice ? "border-red-500" : ""}`}
            {...register("costPrice", { valueAsNumber: true })}
          />
          {errors.costPrice && (
            <p className="bottom-0 absolute text-red-300 text-sm">{errors.costPrice.message}</p>
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
            className={`w-full input-dark ${errors.lowStockThreshold ? "border-red-500" : ""}`}
            {...register("lowStockThreshold", { valueAsNumber: true })}
          />
          {errors.lowStockThreshold && (
            <p className="bottom-0 absolute text-red-300 text-sm">
              {errors.lowStockThreshold.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block mb-2 font-medium text-slate-300 text-sm">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full input-dark"
            {...register("description")}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 md:col-span-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEditFromHook}
              className="flex items-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border-gray-500/50 btn-3d-glass"
            >
              <XCircle className="w-5 h-5" /> Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass"
          >
            {isSubmitting ? (
              <div className="border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
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