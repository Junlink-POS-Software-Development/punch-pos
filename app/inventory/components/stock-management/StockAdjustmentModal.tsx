"use client";

import React from "react";
import { X } from "lucide-react";
import { StockForm } from "./StockForm";
import { StockData } from "./lib/stocks.api";
import { StockFormSchema } from "./utils/types";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockFormSchema) => void;
  itemToEdit?: StockData | null;
  onCancelEdit: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  itemToEdit,
  onCancelEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm animate-in duration-200 fade-in p-4">
      <div className="bg-slate-900 shadow-2xl border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden glass-effect flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-slate-700/50 border-b shrink-0">
          <h2 className="font-semibold text-white text-lg">
            {itemToEdit ? "Edit Stock Entry" : "Add Stock Entry"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto custom-scrollbar">
          <StockForm
            onSubmit={onSubmit}
            itemToEdit={itemToEdit}
            onCancelEdit={onCancelEdit}
          />
        </div>
      </div>
    </div>
  );
};
