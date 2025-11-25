// app/inventory/components/item-registration/ItemForm.tsx

"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form"; // Import Controller
import {
  XCircle,
  Upload,
  Send,
  AlertTriangle,
  User,
  Users,
} from "lucide-react";
import { Item } from "../utils/itemTypes";
import { useItemForm } from "./hooks/useItemForm";
import { useItemBatchUpload } from "./hooks/useItemBatchUpload";

// Import our new component
import { CategorySelect } from "../utils/CategorySelect";

interface ItemFormProps {
  itemToEdit?: Item;
  onFormSubmit: (data: Item) => void;
  onCancelEdit: () => void;
}

type RegisterView = "single" | "batch";

export const ItemForm: React.FC<ItemFormProps> = ({
  itemToEdit,
  onFormSubmit,
  onCancelEdit,
}) => {
  // Destructure control from the hook (ensure your useItemForm returns 'control')
  // If useItemForm doesn't expose control, you might need to grab it from the useForm call inside.
  // Assuming useItemForm returns the methods or we can access them. 
  // NOTE: If useItemForm hides useForm, we need to make sure it exports 'control'.
  // For this snippet, I'll assume useItemForm exports everything from useForm.
  
  const {
    isEditing,
    register,
    control, // <--- MAKE SURE THIS IS EXPORTED FROM YOUR HOOK
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
  const [view, setView] = useState<RegisterView>("single");

  return (
    <>
      {/* ... Header & Toggle Sections (No Changes) ... */}
      <div>
        <h2 className="mb-6 font-semibold text-xl">
          {isEditing ? "Edit Item" : "Register New Item"}
        </h2>
        {!isEditing && (
          <div className="flex items-center gap-4 bg-gray-900/50 mb-6 p-2 rounded-lg">
             {/* ... Toggle Buttons ... */}
             <button onClick={() => setView("single")} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl ${view === "single" ? "bg-blue-500/30 border-blue-500/50" : "text-gray-400 hover:text-white"}`}>
                <User className="w-4 h-4" /> Single Item
             </button>
             <button onClick={() => setView("batch")} className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl ${view === "batch" ? "bg-blue-500/30 border-blue-500/50" : "text-gray-400 hover:text-white"}`}>
                <Users className="w-4 h-4" /> Batch Upload
             </button>
          </div>
        )}
      </div>

      {(isEditing || view === "single") && (
        <div>
          <form
            onSubmit={handleRHFSubmit}
            onKeyDown={handleKeyDown}
            className="gap-6 grid grid-cols-1 md:grid-cols-2 bg-slate-900 shadow-lg p-4 rounded-lg"
          >
            {/* ... Item Name & SKU (No Changes) ... */}
            <div className="relative pb-5">
               <label htmlFor="item-name" className="block mb-2 font-medium text-slate-300 text-sm">Item Name</label>
               <input type="text" className={`w-full input-dark ${errors.itemName ? "border-red-500" : ""}`} {...register("itemName")} />
               {errors.itemName && <p className="bottom-0 absolute text-red-300 text-sm">{errors.itemName.message}</p>}
            </div>

            <div className="relative pb-5">
               <label htmlFor="item-sku" className="block mb-2 font-medium text-slate-300 text-sm">SKU / Barcode</label>
               <input type="text" className={`w-full input-dark ${errors.sku ? "border-red-500" : ""}`} {...register("sku")} />
               {errors.sku && <p className="bottom-0 absolute text-red-300 text-sm">{errors.sku.message}</p>}
            </div>

            {/* --- UPDATED CATEGORY FIELD --- */}
            <div>
              <label
                htmlFor="category"
                className="block mb-2 font-medium text-slate-300 text-sm"
              >
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

            {/* ... Cost Price, Description & Buttons (No Changes) ... */}
            <div className="relative pb-5">
               <label htmlFor="cost-price" className="block mb-2 font-medium text-slate-300 text-sm">Cost Price (₱)</label>
               <input type="number" step="0.01" className={`w-full input-dark ${errors.costPrice ? "border-red-500" : ""}`} {...register("costPrice", { valueAsNumber: true })} />
               {errors.costPrice && <p className="bottom-0 absolute text-red-300 text-sm">{errors.costPrice.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block mb-2 font-medium text-slate-300 text-sm">Description</label>
              <textarea rows={3} className="w-full input-dark" {...register("description")}></textarea>
            </div>

            <div className="flex justify-end gap-4 md:col-span-2">
               {isEditing && <button type="button" onClick={onCancelEditFromHook} className="flex items-center gap-2 bg-gray-500/30 hover:bg-gray-500/40 border-gray-500/50 btn-3d-glass"><XCircle className="w-5 h-5" /> Cancel</button>}
               <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-green-500/30 hover:bg-green-500/40 border-green-500/50 btn-3d-glass">
                 {isSubmitting ? <div className="border-white border-t-2 border-r-2 rounded-full w-5 h-5 animate-spin"></div> : isEditing ? "Update Item" : "Register Item"}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* ... Batch Upload Section (No Changes) ... */}
      {!isEditing && view === "batch" && (
         <div className="text-slate-400">
             {/* ... existing batch logic ... */}
             <p className="mb-4 text-sm">Batch upload logic here...</p>
             {/* I omitted the full batch code for brevity, keep your existing code */}
         </div>
      )}
    </>
  );
};