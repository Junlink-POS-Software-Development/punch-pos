"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { Item, itemSchema, defaultItemValues } from "./utils/itemTypes";

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
    formState: { errors },
  } = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: defaultItemValues,
  });

  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (isEditing) {
      reset(itemToEdit);
    } else {
      reset(defaultItemValues);
    }
  }, [itemToEdit, isEditing, reset]);

  const onSubmit = (formData: Item) => {
    onFormSubmit(formData);
    // If registering a new item, clear the form after submission
    // so the user can immediately enter the next item.
    if (!isEditing) {
      reset(defaultItemValues);
    }
  };

  // --- MODIFIED HANDLE KEY DOWN ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    const form = e.currentTarget;

    // Case 1: Shift + Enter in Textarea -> Submit Form
    if (target.tagName === "TEXTAREA" && e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      // requestSubmit() triggers the native submit event, which React Hook Form's handleSubmit will catch.
      form.requestSubmit();
      return;
    }

    // Case 2: Enter (alone) in regular Input -> Move Focus to Next
    if (target.tagName === "INPUT" && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default form submission

      // Find all focusable data entry fields in standard DOM order
      const focusableFields = Array.from(
        form.querySelectorAll(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled])'
        )
      ) as HTMLElement[];

      const currentIndex = focusableFields.indexOf(target);

      // If we found the current field and it's not the last one, move to the next
      if (currentIndex > -1 && currentIndex < focusableFields.length - 1) {
        focusableFields[currentIndex + 1].focus();
      }
    }
    // Note: Regular 'Enter' in textarea will still perform its default action (new line)
  };
  // --------------------------------

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
        <div>
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
            <p className="mt-1 text-red-300 text-sm">
              {errors.itemName.message}
            </p>
          )}
        </div>
        {/* SKU / Barcode */}
        <div>
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
            <p className="mt-1 text-red-300 text-sm">{errors.sku.message}</p>
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
        <div>
          <label
            htmlFor="cost-price"
            className="block mb-2 font-medium text-slate-300 text-sm"
          >
            Cost Price ($)
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
            <p className="mt-1 text-red-300 text-sm">
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
            >
              <XCircle className="w-5 h-5" />
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass"
          >
            {isEditing ? "Update Item" : "Register Item"}
          </button>
        </div>
      </form>
    </div>
  );
};
