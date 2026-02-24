// app/inventory/components/item-registration/add-item/BatchImportForm.tsx

import React, { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { BatchImportReviewTable, BatchItem } from "./BatchImportReviewTable";
import { Category } from "../lib/categories.api";

interface BatchImportFormProps {
  batchRawText: string;
  setBatchRawText: (text: string) => void;
  handleBatchParse: () => void;
  onCancel: () => void;
  batchStep: "input" | "review";
  parsedBatchItems: BatchItem[];
  handleBatchSubmit: (items: any[], autoCreateCategories: boolean) => void;
  isProcessing?: boolean;
  setBatchStep: (step: "input" | "review") => void;
  categories: Category[];
}

const BatchImportForm: React.FC<BatchImportFormProps> = ({
  batchRawText,
  setBatchRawText,
  handleBatchParse,
  onCancel,
  batchStep,
  parsedBatchItems,
  handleBatchSubmit,
  isProcessing,
  setBatchStep,
  categories
}) => {
  const [autoCreateCategories, setAutoCreateCategories] = useState(true);

  if (batchStep === "review") {
      return (
          <BatchImportReviewTable 
            initialItems={parsedBatchItems}
            onBack={() => setBatchStep("input")}
            onSubmit={handleBatchSubmit}
            isProcessing={isProcessing || false}
            categories={categories}
            autoCreateCategories={autoCreateCategories}
          />
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex items-start gap-4 backdrop-blur-sm shadow-inner">
        <div className="p-2 bg-primary/20 text-primary rounded-xl shadow-lg">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-foreground font-bold text-sm uppercase tracking-wider">
            CSV Format Guide
          </h3>
          <p className="text-muted-foreground/80 text-sm mt-1 mb-3">
            Format each line exactly as shown to ensure successful processing:
          </p>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Header Structure</p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              Name, Category, Selling Price (Price), Cost Price (Unit Cost), Stock, MinStock, Description
            </p>
            <div className="h-px bg-white/5 my-2" />
            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Example Data</p>
            <code className="block text-xs font-mono text-foreground/80 break-all leading-relaxed">
              Latte, Beverage, 120, 45, 100, 10, "Smooth espresso with steamed milk"
              <br />
              Blueberry Muffin, Food, 85, 40, 24, 5, "Freshly baked daily"
            </code>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
          Paste Inventory Data
        </label>
        <textarea
          value={batchRawText}
          onChange={(e) => setBatchRawText(e.target.value)}
          className="w-full h-56 px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground/20 shadow-inner transition-all resize-none"
          placeholder="LATTE, BEVERAGE, 120, 45, 100, 10, 'Morning bestseller'..."
        ></textarea>
      </div>

      <div className="flex items-center gap-2 px-2">
          <input
            type="checkbox"
            id="autoCreateCategories"
            checked={autoCreateCategories}
            onChange={(e) => setAutoCreateCategories(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary size-4"
          />
          <label htmlFor="autoCreateCategories" className="text-sm text-muted-foreground cursor-pointer select-none">
             Automatically create missing categories
          </label>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <button className="flex items-center gap-2 text-primary/60 hover:text-primary text-xs font-bold uppercase tracking-widest transition-all px-4 py-2 hover:bg-white/5 rounded-xl">
          <Upload size={18} /> Upload file
        </button>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="px-8 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleBatchParse}
            disabled={!batchRawText}
            className="px-10 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
          >
            Review & Import
          </button>
        </div>
      </div>
    </div>

  );
};

export default BatchImportForm;
