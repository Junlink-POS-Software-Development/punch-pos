// app/inventory/components/stock-management/StockManagement.tsx

"use client";

import { useState, useEffect } from "react";
import { useStocks } from "../../hooks/useStocks";
import { StockData } from "./lib/stocks.api";
import { StockFormSchema } from "./utils/types";
import { ErrorMessage } from "@/components/sales-terminnal/components/ErrorMessage";
import { PackagePlus } from "lucide-react";
import { StockAdjustmentModal } from "./StockAdjustmentModal";
import { BatchStockUpdateModal } from "./BatchStockUpdateModal";
import StockTable from "./StockTable";
import { ExpiryMonitor } from "./ExpiryMonitor";

const StockManagementContent = () => {
  const [activeTab, setActiveTab] = useState<"history" | "expiry">("history");
  const [editingItem, setEditingItem] = useState<StockData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  
  const { addStockEntry, editStockEntry, isProcessing } = useStocks();

  // Handle Tab shortcut to open adjustment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open on "Tab" if modal is closed and not typing in an input
      if (e.key === "Tab" && !isModalOpen) {
        // Optional: Check if the target is an input/textarea/select to avoid stealing focus
        const target = e.target as HTMLElement;
        const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;
        
        if (!isTyping) {
          e.preventDefault();
          handleOpenAdjustment();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

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
    <div className="flex flex-col h-[calc(100vh-100px)] px-6 pb-6 pt-2 space-y-4">
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />
      
      {/* Header & Actions - REMOVED PER REFINEMENT */}

      {/* Status Section */}
      {isProcessing && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-primary text-center animate-pulse">
          Processing stock adjustment...
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-primary/20 mb-2">
        <button 
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"}`}
        >
          Stock Movement
        </button>
        <button 
          onClick={() => setActiveTab("expiry")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "expiry" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"}`}
        >
          Expiry Monitor
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeTab === "history" ? (
          <StockTable 
            onEdit={handleEdit} 
            onAdd={handleOpenAdjustment}
            isAdding={isModalOpen}
            onBatchAdd={() => setIsBatchModalOpen(true)}
          />
        ) : (
          <div className="h-full overflow-y-auto pr-2">
            <ExpiryMonitor />
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleStockSubmit}
        itemToEdit={editingItem}
        onCancelEdit={handleCancelEdit}
      />
      
      {/* Batch Update Modal */}
      <BatchStockUpdateModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />
    </div>
  );
};

export function StockManagement() {
  return (
      <StockManagementContent />
  );
}