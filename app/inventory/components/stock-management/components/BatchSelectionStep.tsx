"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronRight } from "lucide-react"; // Removed Check, X imports as they moved to table
import { Item } from "../../item-registration/utils/itemTypes";
import { useStocks } from "../../../hooks/useStocks";

import { BatchField } from "../hooks/useBatchStockForm";
import { BatchSelectionTable } from "./BatchSelectionTable";

interface BatchSelectionStepProps {
  items: Item[];
  batchData: any;
  getItemState: (item: Item) => any;
  updateField: (item: Item, field: keyof BatchField, value: any) => void;
  confirmSelection: (item: Item) => void;
  cancelSelection: (item: Item) => void;
  onProceed: () => void;
}

export const BatchSelectionStep: React.FC<BatchSelectionStepProps> = ({
  items,
  getItemState,
  updateField,
  confirmSelection,
  cancelSelection,
  onProceed,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { stocks } = useStocks();

  // Calculate live stocks map (reused logic)
  const liveStocks = useMemo(() => {
    const map: Record<string, number> = {};
    stocks.forEach((s) => {
      const current = map[s.item_name] || 0;
      const change = s.flow === "stock-in" ? s.quantity : -s.quantity;
      map[s.item_name] = current + change;
    });
    return map;
  }, [stocks]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => item.itemName.toLowerCase().includes(term));
  }, [items, searchTerm]);

  // Count selected items for the footer button
  const selectedCount = useMemo(() => {
    return items.filter(i => getItemState(i).selected).length;
  }, [items, getItemState]);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header Search */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
        <h2 className="font-semibold text-white text-lg">Select Items to Update</h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all w-64"
            autoFocus
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <BatchSelectionTable
          items={filteredItems}
          getItemState={getItemState}
          updateField={updateField}
          confirmSelection={confirmSelection}
          cancelSelection={cancelSelection}
          liveStocks={liveStocks}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
        <div className="text-sm text-gray-400">
          <span className="text-white font-bold">{selectedCount}</span> items selected
        </div>
        <button
          onClick={onProceed}
          disabled={selectedCount === 0}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-semibold shadow-lg shadow-blue-900/20"
        >
          Review Batch
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
