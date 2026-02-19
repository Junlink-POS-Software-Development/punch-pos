"use client";

import React from "react";
import { ChevronLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { Item } from "../../item-registration/utils/itemTypes";

interface BatchReviewStepProps {
  selectedItems: Item[];
  batchData: any;
  totals: { totalQty: number; totalCost: number; count: number };
  onBack: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const BatchReviewStep: React.FC<BatchReviewStepProps> = ({
  selectedItems,
  batchData,
  totals,
  onBack,
  onSubmit,
  isProcessing,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900 shrink-0">
        <h2 className="font-semibold text-white text-xl mb-1">Review Batch Update</h2>
        <p className="text-slate-400 text-sm">
          Please confirm the following stock adjustments before submitting.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 p-6 shrink-0">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Total Items</div>
          <div className="text-2xl font-bold text-white">{totals.count}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Total Quantity Adding</div>
          <div className="text-2xl font-bold text-blue-400">+{totals.totalQty}</div>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Est. Capital Value</div>
          <div className="text-2xl font-bold text-emerald-400">
             ₱{totals.totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto custom-scrollbar px-6 pb-6">
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="p-4 w-1/3">Item Name</th>
                <th className="p-4 text-center">Add Qty</th>
                <th className="p-4 text-right">Capital Price</th>
                <th className="p-4 w-1/3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {selectedItems.map((item) => {
                const data = batchData[item.id!];
                return (
                  <tr key={item.id} className="text-sm">
                    <td className="p-4 text-slate-300 font-medium">
                      {item.itemName}
                      {item.sku && <div className="text-xs text-gray-600">{item.sku}</div>}
                    </td>
                    <td className="p-4 text-center font-mono text-blue-300">
                      +{data.addQuantity}
                    </td>
                    <td className="p-4 text-right font-mono text-emerald-300">
                      ₱{(data.capitalPrice ?? 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-500 italic">
                      {data.notes || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Edit
        </button>

        <div className="flex items-center gap-4">
           {/* Info / Warning could go here */}
           <div className="flex items-center gap-2 text-yellow-500/80 text-xs bg-yellow-900/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Actions cannot be undone</span>
           </div>

           <button
            onClick={onSubmit}
            disabled={isProcessing}
            className="flex items-center gap-2 px-8 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg shadow-emerald-900/20 active:scale-95 transition-all font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Confirm Update
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
