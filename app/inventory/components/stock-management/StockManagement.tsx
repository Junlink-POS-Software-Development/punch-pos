// app/inventory/components/stock-management/StockManagement.tsx

"use client";

import { useState } from "react";
import { StockForm } from "./StockForm";
import StockTable from "./StockTable";
import { useStocks } from "../../hooks/useStocks";
import { StockData } from "./lib/stocks.api";
import { StockFormSchema } from "./utils/types";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";


const StockManagementContent = () => {
  const [editingItem, setEditingItem] = useState<StockData | null>(null);
  
  // 2. Get Layout State
  const { isSplit } = useViewStore();

  const { addStockEntry, editStockEntry, isProcessing } = useStocks();

  const handleStockSubmit = (data: StockFormSchema) => {
    if (editingItem) {
      editStockEntry(
        editingItem.id,
        {
          itemName: editingItem.item_name,
          stockFlow: data.stockFlow,
          quantity: data.quantity,
          capitalPrice: data.capitalPrice,
          notes: data.notes ?? "",
        },
        {
          onSuccess: () => {
            setEditingItem(null);
          },
        }
      );
    } else {
      addStockEntry(data);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  return (
    // 3. Update Layout: Vertical stack normally; Side-by-side grid when full screen (!isSplit)
    <div className={
      isSplit 
        ? "flex flex-col gap-6 p-6" 
        : "grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 p-6 items-start"
    }>
      <div className="relative p-4 glass-effect">
        {isProcessing && (
          <div className="z-10 absolute inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm rounded-lg">
            <span className="font-bold text-white">Processing...</span>
          </div>
        )}

        <h2 className="mb-2 font-semibold text-gray-200 text-xl">
          {editingItem ? "Edit Stock Entry" : "Add Stock Entry"}
        </h2>
        <p className="mb-6 text-slate-400 text-sm">
          {editingItem
            ? `Updating record for: ${editingItem.item_name}`
            : "Fill out the form below to record a new stock movement."}
        </p>

        <StockForm
          onSubmit={handleStockSubmit}
          itemToEdit={editingItem}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <div className="p-4 glass-effect">
        <StockTable onEdit={(item) => setEditingItem(item)} />
      </div>
    </div>
  );
};

export function StockManagement() {
  return (
      <StockManagementContent />
  );
}