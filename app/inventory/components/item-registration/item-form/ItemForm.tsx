// app/inventory/components/item-registration/ItemForm.tsx

"use client";

import React, { useState } from "react"; // 1. Import useState
import {
  XCircle,
  Upload,
  Send,
  AlertTriangle,
  User,
  Users,
} from "lucide-react"; // 2. Added User/Users icons
import { Item } from "../utils/itemTypes";
import { useItemForm } from "./hooks/useItemForm";
import { useItemBatchUpload } from "./hooks/useItemBatchUpload";

interface ItemFormProps {
  itemToEdit?: Item;
  onFormSubmit: (data: Item) => void;
  onCancelEdit: () => void;
}

// 3. Define the view type
type RegisterView = "single" | "batch";

export const ItemForm: React.FC<ItemFormProps> = ({
  itemToEdit,
  onFormSubmit,
  onCancelEdit,
}) => {
  // --- Call hooks unconditionally ---
  const {
    isEditing,
    register,
    handleRHFSubmit,
    handleKeyDown,
    errors,
    isSubmitting,
    onCancelEdit: onCancelEditFromHook,
  } = useItemForm({
    itemToEdit,
    onFormSubmit,
    onCancelEdit,
  });

  const batchUpload = useItemBatchUpload();

  // 4. Add state for the toggle
  const [view, setView] = useState<RegisterView>("single");

  return (
    <>
      {/* --- SECTION 1: HEADER & TOGGLE --- */}
      <div>
        <h2 className="mb-6 font-semibold text-xl">
          {isEditing ? "Edit Item" : "Register New Item"}
        </h2>

        {/* 5. Show toggle ONLY if NOT editing */}
        {!isEditing && (
          <div className="flex items-center gap-4 bg-gray-900/50 mb-6 p-2 rounded-lg">
            <button
              type="button"
              onClick={() => setView("single")}
              className={`
                flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl
                ${
                  view === "single"
                    ? "bg-blue-500/30 border-blue-500/50"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <User className="w-4 h-4" />
              Single Item
            </button>
            <button
              type="button"
              onClick={() => setView("batch")}
              className={`
                flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl
                ${
                  view === "batch"
                    ? "bg-blue-500/30 border-blue-500/50"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <Users className="w-4 h-4" />
              Batch Upload
            </button>
          </div>
        )}
      </div>

      {/* --- SECTION 2: CONDITIONAL CONTENT --- */}

      {/* 6. Show SINGLE FORM if (editing) OR (view is 'single') */}
      {(isEditing || view === "single") && (
        <div>
          <form
            onSubmit={handleRHFSubmit}
            onKeyDown={handleKeyDown}
            className="gap-6 grid grid-cols-1 md:grid-cols-2 bg-slate-900 shadow-lg p-4 rounded-lg"
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
                  onClick={onCancelEditFromHook}
                  className="flex items-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border-gray-500/50 btn-3d-glass"
                  disabled={isSubmitting}
                >
                  <XCircle className="w-5 h-5" />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass"
                disabled={isSubmitting}
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
      )}

      {/* 7. Show BATCH FORM if (NOT editing) AND (view is 'batch') */}
      {!isEditing && view === "batch" && (
        <div>
          <p className="mb-4 text-slate-400 text-sm">
            Upload a CSV file with columns: <strong>itemName</strong>,{" "}
            <strong>sku</strong>, <strong>category</strong>,{" "}
            <strong>costPrice</strong>, <strong>description</strong>. Only
            &apos;description&apos; and &apos;category&apos; are optional.
          </p>

          <div className="flex items-start gap-4">
            <label
              htmlFor="csv-upload"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer
                bg-blue-500/30 hover:bg-blue-500/40 border-blue-500/50 btn-3d-glass
                ${
                  batchUpload.isParsing || batchUpload.isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
            >
              <Upload className="w-5 h-5" />
              <span>{batchUpload.file ? "File selected" : "Choose File"}</span>
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                className="hidden"
                onChange={batchUpload.handleFileChange}
                disabled={batchUpload.isParsing || batchUpload.isSubmitting}
              />
            </label>

            {batchUpload.file && (
              <button
                type="button"
                onClick={batchUpload.reset}
                className="flex items-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border-gray-500/50 btn--glass"
                disabled={batchUpload.isParsing || batchUpload.isSubmitting}
              >
                <XCircle className="w-5 h-5" />
                Clear
              </button>
            )}
          </div>

          {/* --- Results Display --- */}
          <div className="space-y-4 mt-6">
            {batchUpload.isParsing && (
              <div className="flex items-center gap-2 text-blue-300">
                <div className="border-white border-t-2 border-r-2 rounded-full w-4 h-4 animate-spin"></div>
                Parsing file...
              </div>
            )}

            {/* Valid Items Summary */}
            {batchUpload.validItems.length > 0 && (
              <div className="bg-green-500/10 p-4 border border-green-500/30 rounded-md text-green-300">
                <h3 className="mb-2 font-semibold">
                  Found {batchUpload.validItems.length} valid items
                </h3>
                <p className="text-sm">Ready to be uploaded.</p>
                <button
                  type="button"
                  onClick={batchUpload.handleSubmit}
                  disabled={batchUpload.isSubmitting}
                  className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 mt-3 border-green-500/50 btn-3d-glass"
                >
                  {batchUpload.isSubmitting ? (
                    <>
                      <div className="border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Upload Valid Items
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Errors Summary */}
            {batchUpload.errors.length > 0 && (
              <div className="bg-red-500/10 p-4 border border-red-500/30 rounded-md text-red-300">
                <h3 className="flex items-center gap-2 mb-2 font-semibold">
                  <AlertTriangle className="w-5 h-5" />
                  Found {batchUpload.errors.length} invalid rows
                </h3>
                <ul className="space-y-1 pl-5 max-h-40 overflow-y-auto text-sm list-disc">
                  {batchUpload.errors.map((err, i) => (
                    <li key={i}>
                      <strong>Row {err.row}:</strong> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
