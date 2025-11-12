"use client";

import React, { useEffect, useState } from "react"; // 1. Import useState
import { useForm, FieldErrors } from "react-hook-form"; // 2. Import FieldErrors type (optional, for type safety)
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { Item, itemSchema, defaultItemValues } from "./utils/itemTypes";
// 3. Import the new API function (adjust path as needed)
import { checkItemExistence } from "./lib/item.api";

interface ItemFormProps {
  itemToEdit?: Item;
  onFormSubmit: (data: Item) => void;
  onCancelEdit: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  itemToEdit,
  onFormSubmit,
  onCancelEdit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError, // 4. Add setError to manually register errors
    formState: { errors, isSubmitting }, // 5. Use isSubmitting for loading state
  } = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: defaultItemValues,
  });

  const isEditing = !!itemToEdit;
  const ignoreId = isEditing && itemToEdit?.id ? itemToEdit.id : undefined;

  useEffect(() => {
    if (isEditing) {
      reset(itemToEdit);
    } else {
      reset(defaultItemValues);
    }
  }, [itemToEdit, isEditing, reset]);

  // --- MODIFIED SUBMISSION HANDLER ---
  const onSubmit = async (formData: Item) => {
    let hasError = false;

    // Check 1: Item Name Existence
    if (formData.itemName) {
      const itemExists = await checkItemExistence(
        "itemName",
        formData.itemName,
        ignoreId
      );
      if (itemExists) {
        setError(
          "itemName",
          {
            type: "custom",
            message: "This Item Name already exists.",
          },
          { shouldFocus: true }
        );
        hasError = true;
      }
    }

    // Check 2: SKU Existence
    if (formData.sku) {
      const skuExists = await checkItemExistence("sku", formData.sku, ignoreId);
      if (skuExists) {
        setError(
          "sku",
          {
            type: "custom",
            message: "This SKU/Barcode already exists.",
          },
          { shouldFocus: !hasError }
        ); // Only focus if itemName didn't get an error
        hasError = true;
      }
    }

    if (hasError) {
      // Stop submission if async validation failed
      return;
    }

    onFormSubmit(formData);

    if (!isEditing) {
      reset(defaultItemValues);
    }
  };
  // ------------------------------------

  // ... (handleKeyDown function remains the same) ...
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    const form = e.currentTarget;

    if (target.tagName === "TEXTAREA" && e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
      return;
    }

    if (target.tagName === "INPUT" && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const focusableFields = Array.from(
        form.querySelectorAll(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled])'
        )
      ) as HTMLElement[];

      const currentIndex = focusableFields.indexOf(target);

      if (currentIndex > -1 && currentIndex < focusableFields.length - 1) {
        focusableFields[currentIndex + 1].focus();
      }
    }
  };

  return (
    <div>
      <h2 className="mb-6 font-semibold text-xl">
        {isEditing ? "Edit Item" : "Register New Item"}
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className="gap-6 grid grid-cols-1 md:grid-cols-2"
      >
        {/* Item Name */}
        <div className="relative pb-5">
          <label
            htmlFor="item-name"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Item Name
          </label>
          <input
            type="text"
            id="item-name"
            className={`w-full input-dark ${
              errors.itemName ? "border-red-500" : ""
            }`}
            placeholder="e.g., 'Product A'"
            {...register("itemName")}
          />
          {errors.itemName && (
            <p className="bottom-0 absolute text-red-300 text-sm">
              {errors.itemName.message}
            </p>
          )}
        </div>
        {/* SKU / Barcode */}
        <div className="relative pb-5">
          <label
            htmlFor="item-sku"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            SKU / Barcode
          </label>
          <input
            type="text"
            id="item-sku"
            className={`w-full input-dark ${
              errors.sku ? "border-red-500" : ""
            }`}
            placeholder="e.g., '12345-ABC'"
            {...register("sku")}
          />
          {errors.sku && (
            <p className="bottom-0 absolute text-red-300 text-sm">
              {errors.sku.message}
            </p>
          )}
        </div>
        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Category
          </label>
          <input
            type="text"
            id="category"
            className="w-full input-dark"
            placeholder="e.g., 'Electronics'"
            {...register("category")}
          />
        </div>
        {/* Cost Price */}
        <div className="relative pb-5">
          <label
            htmlFor="cost-price"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Cost Price (₱)
          </label>
          <input
            type="number"
            id="cost-price"
            className={`w-full input-dark ${
              errors.costPrice ? "border-red-500" : ""
            }`}
            placeholder="0.00"
            step="0.01"
            {...register("costPrice", {
              valueAsNumber: true,
            })}
          />
          {errors.costPrice && (
            <p className="bottom-0 absolute text-red-300 text-sm">
              {errors.costPrice.message}
            </p>
          )}
        </div>
        {/* Description */}
        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Description
            <span className="ml-2 text-slate-500 text-xs">
              (Press Shift+Enter to submit)
            </span>
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full input-dark"
            placeholder="A brief description..."
            {...register("description")}
          ></textarea>
        </div>
        {/* Buttons */}
        <div className="flex justify-end gap-4 md:col-span-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex items-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border-gray-500/50 btn-3d-glass"
              disabled={isSubmitting} // Disable while checking/submitting
            >
              <XCircle className="w-5 h-5" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass"
            disabled={isSubmitting} // Disable while checking/submitting
          >
            {isSubmitting ? (
              // Display a small spinner while checking the database
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
