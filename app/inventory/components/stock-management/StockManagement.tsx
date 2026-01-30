// app/inventory/components/stock-management/StockManagement.tsx

"use client";

import { useState } from "react";
import { useStocks } from "../../hooks/useStocks";
import { StockData } from "./lib/stocks.api";
import { StockFormSchema } from "./utils/types";
import { ErrorMessage } from "@/components/sales-terminnal/components/ErrorMessage";
import { PackagePlus } from "lucide-react";
import { StockAdjustmentModal } from "./StockAdjustmentModal";
import StockTable from "./StockTable";

const StockManagementContent = () => {
  const [editingItem, setEditingItem] = useState<StockData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
            setIsModalOpen(false);
          },
          onError: (err) => {
            setErrorMessage(err.message);
          }
        }
      );
    } else {
      addStockEntry(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
        onError: (err) => {
          setErrorMessage(err.message);
        }
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleOpenAdjustment = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: StockData) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] px-6 pb-6 pt-2 space-y-4">
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      
      {/* Header & Actions - REMOVED PER REFINEMENT */}

      {/* Status Section */}
      {isProcessing && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-center animate-pulse">
          Processing stock adjustment...
        </div>
      )}

      {/* Table Section */}
      <div className="flex-1 bg-slate-900/50 p-6 border border-slate-800 rounded-xl overflow-hidden glass-effect">
        <StockTable onEdit={handleEdit} />
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleStockSubmit}
        itemToEdit={editingItem}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export function StockManagement() {
  return (
      <StockManagementContent />
  );
}