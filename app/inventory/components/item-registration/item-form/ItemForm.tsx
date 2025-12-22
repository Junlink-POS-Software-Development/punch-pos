// app/inventory/components/item-registration/ItemForm.tsx

"use client";

import React, { useState } from "react";
import { Users, User } from "lucide-react";
import { Item } from "../utils/itemTypes";


// Import separated components
import { SingleItemRegistry } from "./SingleItemRegistry";
import { BatchItemRegistry } from "./BatchItemRegistry";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";

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
  const { isSplit } = useViewStore();
  const [view, setView] = useState<RegisterView>("single");

  // If editing, we just show the Single form directly
  if (itemToEdit) {
    return (
      <SingleItemRegistry
        itemToEdit={itemToEdit}
        onFormSubmit={onFormSubmit}
        onCancelEdit={onCancelEdit}
      />
    );
  }

  // --- Visibility Logic ---
  // 1. Toggle Buttons:
  //    - Split Mode: Always Visible
  //    - Full Mode (!isSplit): Visible ONLY on Mobile (hidden on desktop/md)
  const toggleVisibilityClass = isSplit ? "flex" : "flex md:hidden";

  // 2. Component Visibility (CSS-based for responsiveness):
  //    - If current view matches: Always visible
  //    - If current view DOES NOT match:
  //        - Split Mode: Hidden (display: none)
  //        - Full Mode (!isSplit): Hidden on Mobile, Block on Desktop
  
  const getComponentVisibility = (componentView: RegisterView) => {
    if (view === componentView) return "block"; // Active view is always shown
    
    // Inactive view logic:
    if (isSplit) return "hidden"; // In split mode, inactive is strictly hidden
    return "hidden xl:block";     // In full mode, inactive is hidden on mobile, visible on desktop
  };

  return (
    <div className="w-full h-full">
      {/* View Toggle Buttons */}
      <div className={`${toggleVisibilityClass} items-center gap-4 bg-gray-900/50 mb-6 p-2 rounded-lg`}>
        <button
          onClick={() => setView("single")}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl transition-all ${
            view === "single"
              ? "bg-blue-500/30 border-blue-500/50 text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <User className="w-4 h-4" /> Single Item
        </button>
        <button
          onClick={() => setView("batch")}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl transition-all ${
            view === "batch"
              ? "bg-blue-500/30 border-blue-500/50 text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" /> Batch Upload
        </button>
      </div>

      {/* Layout Container:
         - Mobile: Always block (stacked/toggled)
         - Desktop Full (!isSplit): Grid
         - Desktop Split (isSplit): Block 
      */}
      <div
        className={
          !isSplit
            ? "grid grid-cols-1 xl:grid-cols-2 gap-6 items-start"
            : "block"
        }
      >
        {/* Single Registration Wrapper */}
        <div className={`w-full ${getComponentVisibility("single")}`}>
          <SingleItemRegistry
            itemToEdit={itemToEdit}
            onFormSubmit={onFormSubmit}
            onCancelEdit={onCancelEdit}
          />
        </div>

        {/* Batch Registration Wrapper */}
        <div className={`w-full ${getComponentVisibility("batch")}`}>
          <BatchItemRegistry />
        </div>
      </div>
    </div>
  );
};