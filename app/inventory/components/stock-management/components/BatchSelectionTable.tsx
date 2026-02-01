"use client";

import React, { useMemo } from "react";
import { Check, X } from "lucide-react";
import { Item } from "../../item-registration/utils/itemTypes";
import { BatchField } from "../hooks/useBatchStockForm";

interface BatchSelectionTableProps {
  items: Item[];
  getItemState: (item: Item) => BatchField;
  updateField: (item: Item, field: keyof BatchField, value: any) => void;
  confirmSelection: (item: Item) => void;
  cancelSelection: (item: Item) => void;
  liveStocks: Record<string, number>;
}

export const BatchSelectionTable: React.FC<BatchSelectionTableProps> = ({
  items,
  getItemState,
  updateField,
  confirmSelection,
  cancelSelection,
  liveStocks,
}) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead className="bg-slate-950 sticky top-0 z-10 text-xs uppercase font-semibold text-gray-400">
        <tr>
          <th className="p-4 border-b border-slate-800 w-16 text-center">Status</th>
          <th className="p-4 border-b border-slate-800">Item Name</th>
          <th className="p-4 border-b border-slate-800 text-right w-24">Live</th>
          <th className="p-4 border-b border-slate-800 w-32">Add Qty</th>
          <th className="p-4 border-b border-slate-800 w-32">Cap. Price</th>
          <th className="p-4 border-b border-slate-800 w-48">Remarks</th>
          <th className="p-4 border-b border-slate-800 w-24 text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/50">
        {items.map((item) => {
          const state = getItemState(item);
          const isModified = state.addQuantity > 0 || state.notes.length > 0;
          const isSelected = state.selected;

          return (
            <tr
              key={item.id}
              className={`group transition-colors ${
                isSelected
                  ? "bg-blue-900/10"
                  : isModified
                  ? "bg-slate-800/20"
                  : "hover:bg-slate-800/30"
              }`}
            >
              {/* Status Indicator */}
              <td className="p-3 text-center">
                <div
                  className={`w-4 h-4 mx-auto rounded border transition-colors ${
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-slate-600 bg-slate-800"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </td>

              <td className="p-3 text-slate-200 font-medium text-sm">
                {item.itemName}
                {item.sku && <div className="text-gray-500 text-[10px]">{item.sku}</div>}
              </td>

              <td className="p-3 text-right">
                <span
                  className={`px-2 py-1 rounded text-xs font-mono ${
                    (liveStocks[item.itemName] || 0) <= (item.lowStockThreshold || 5)
                      ? "text-red-400 bg-red-500/10"
                      : "text-emerald-400 bg-emerald-500/10"
                  }`}
                >
                  {liveStocks[item.itemName] || 0}
                </span>
              </td>

              <td>
                <input
                  type="number"
                  min="0"
                  disabled={isSelected}
                  value={state.addQuantity || ""}
                  onChange={(e) => updateField(item, "addQuantity", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-full bg-slate-950 border rounded px-3 py-1.5 text-sm outline-none transition-all ${
                    isSelected
                      ? "border-transparent text-gray-400 cursor-not-allowed"
                      : "border-slate-800 text-white focus:border-blue-500/50"
                  }`}
                />
              </td>

              <td>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={isSelected}
                  value={state.capitalPrice || ""}
                  onChange={(e) => updateField(item, "capitalPrice", parseFloat(e.target.value) || 0)}
                  className={`w-full bg-slate-950 border rounded px-3 py-1.5 text-sm outline-none transition-all ${
                    isSelected
                      ? "border-transparent text-gray-400 cursor-not-allowed"
                      : "border-slate-800 text-white focus:border-blue-500/50"
                  }`}
                />
              </td>

              <td>
                <input
                  type="text"
                  disabled={isSelected}
                  value={state.notes}
                  onChange={(e) => updateField(item, "notes", e.target.value)}
                  placeholder={isSelected ? "" : "Remarks..."}
                  className={`w-full bg-slate-950 border rounded px-3 py-1.5 text-sm outline-none transition-all ${
                    isSelected
                      ? "border-transparent text-gray-400 cursor-not-allowed"
                      : "border-slate-800 text-white focus:border-blue-500/50"
                  }`}
                />
              </td>

              {/* Actions */}
              <td className="p-3">
                <div className="flex items-center justify-center gap-2">
                  {!isSelected ? (
                    <>
                      <button
                        onClick={() => confirmSelection(item)}
                        className={`p-1.5 rounded transition-colors ${
                          state.addQuantity > 0
                            ? "text-emerald-400 hover:bg-emerald-500/20"
                            : "text-slate-600 cursor-not-allowed"
                        }`}
                        title="Confirm & Select"
                        disabled={state.addQuantity <= 0}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      {isModified && (
                        <button
                          onClick={() => cancelSelection(item)}
                          className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Clear"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => cancelSelection(item)}
                      className="p-1.5 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Remove Selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
