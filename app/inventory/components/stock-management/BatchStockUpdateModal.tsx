"use client";

import React, { useMemo, useState } from "react";
import { X, Search, Save, Loader2 } from "lucide-react";
import { useItems } from "../../hooks/useItems";
import { useStocks } from "../../hooks/useStocks";
import { Item } from "../../components/item-registration/utils/itemTypes";

interface BatchStockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BatchInput = {
  addQuantity: number;
  capitalPrice: number;
  notes: string;
};

export const BatchStockUpdateModal: React.FC<BatchStockUpdateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { items } = useItems();
  const { stocks, addStockEntry } = useStocks();

  const [searchTerm, setSearchTerm] = useState("");
  const [batchData, setBatchData] = useState<Record<string, BatchInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  // Calculate live stocks map
  const liveStocks = useMemo(() => {
    const map: Record<string, number> = {};
    stocks.forEach((s) => {
      const current = map[s.item_name] || 0;
      const change = s.flow === "stock-in" ? s.quantity : -s.quantity;
      map[s.item_name] = current + change;
    });
    return map;
  }, [stocks]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => item.itemName.toLowerCase().includes(term));
  }, [items, searchTerm]);

  // Helper to get input state for an item
  const getInput = (item: Item): BatchInput => {
    return (
      batchData[item.id!] || {
        addQuantity: 0,
        capitalPrice: item.costPrice || 0,
        notes: "",
      }
    );
  };

  const handleInputChange = (
    itemId: string,
    field: keyof BatchInput,
    value: any
  ) => {
    setBatchData((prev) => {
      const current = prev[itemId] || {
        addQuantity: 0, // Should be 0 initially in UI, logic checked later
        capitalPrice: 0, // Check costPrice on init? handled in getInput usually, but need to be careful with state merge
        notes: "",
      };
      
      // If we are initializing the entry for the first time, make sure we grab defaults from the item list if possible?
      // Actually, to keep it simple, we just update what we have.
      // The getInput helper handles the "read" default.
      // But for "write", we need to ensure we don't lose the other defaults if they weren't in state yet.
      
      // Better approach: When writing, if undefined, construct full object from defaults + change.
      // But we don't have item access easily here inside setter unless we pass it.
      // Let's rely on component render to pass consistent updates or just accept 0/empty as base if not present.
      
      // Wait, if I type quantity, capitalPrice matches 0? That's bad.
      // I should update the handler signature to accept the `baseItem` to set defaults correctly if key missing.
      return prev; 
    });
  };

  // Refined input handler
  const updateBatchItem = (item: Item, field: keyof BatchInput, value: any) => {
    setBatchData((prev) => {
      const existing = prev[item.id!] || {
        addQuantity: 0,
        capitalPrice: item.costPrice || 0,
        notes: "",
      };
      return {
        ...prev,
        [item.id!]: { ...existing, [field]: value },
      };
    });
  };

  const handleSubmit = async () => {
    // Identify items with addQuantity > 0
    const itemsToUpdate = Object.entries(batchData)
      .filter(([_, data]) => data.addQuantity > 0)
      .map(([id, data]) => {
        const item = items.find((i) => i.id === id);
        return { item, data };
      })
      .filter((entry) => entry.item !== undefined);

    if (itemsToUpdate.length === 0) {
      alert("No items to update. Please enter quantities.");
      return;
    }

    if (!window.confirm(`Confirm batch update for ${itemsToUpdate.length} items?`)) return;

    setIsSubmitting(true);
    let completed = 0;
    setProgress({ current: 0, total: itemsToUpdate.length });

    // Process sequentially to be safe (or parallel with Promise.all if API handles it)
    // Sequential better for progress feedback
    for (const { item, data } of itemsToUpdate) {
      if (!item) continue;
      try {
        await addStockEntry(
          {
            itemName: item.itemName,
            stockFlow: "stock-in",
            quantity: data.addQuantity,
            capitalPrice: data.capitalPrice,
            notes: data.notes || "Batch Update",
          },
          {
            // Suppress individual alerts? adapt useStocks if needed or just catch here
            // useStocks `addStockEntry` calls `handleMutationSuccess`/Error internally.
            // It might trigger global loading state there too.
          }
        );
      } catch (err) {
        console.error(`Failed to update ${item.itemName}`, err);
        // Continue or stop? Continue usually better for batch.
      }
      completed++;
      setProgress({ current: completed, total: itemsToUpdate.length });
    }

    setIsSubmitting(false);
    setProgress(null);
    setBatchData({});
    onClose();
    alert("Batch update execution completed.");
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-6">
      <div className="bg-slate-900/95 shadow-2xl border border-slate-700 rounded-xl w-full max-w-6xl h-[90vh] overflow-hidden glass-effect flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-slate-700/50 border-b shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-white text-xl">Batch Stock Update</h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all w-64"
                autoFocus
              />
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto custom-scrollbar p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 text-xs uppercase font-semibold text-gray-400">
              <tr>
                <th className="p-4 border-b border-slate-800">Item Name</th>
                <th className="p-4 border-b border-slate-800 text-right">Live Stock</th>
                <th className="p-4 border-b border-slate-800 w-32">Add Qty</th>
                <th className="p-4 border-b border-slate-800 w-32">Cap. Price</th>
                <th className="p-4 border-b border-slate-800 w-64">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredItems.map((item) => {
                const input = getInput(item);
                const isActive = input.addQuantity > 0;
                
                return (
                  <tr 
                    key={item.id} 
                    className={`group transition-colors ${isActive ? 'bg-blue-900/10' : 'hover:bg-slate-800/30'}`}
                  >
                    <td className="p-3 text-slate-200 font-medium text-sm">
                      {item.itemName}
                      {item.sku && <div className="text-gray-500 text-[10px]">{item.sku}</div>}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-1 rounded-md text-xs font-mono font-bold ${
                        (liveStocks[item.itemName] || 0) <= (item.lowStockThreshold || 5) 
                          ? "bg-red-500/20 text-red-400" 
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {liveStocks[item.itemName] || 0}
                      </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        value={input.addQuantity || ""}
                        onChange={(e) => updateBatchItem(item, "addQuantity", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className={`w-full bg-slate-950 border rounded px-3 py-1.5 text-sm outline-none transition-all ${
                          isActive 
                            ? "border-blue-500 text-white font-bold" 
                            : "border-slate-700 text-gray-400 focus:border-blue-500/50 focus:text-gray-200"
                        }`}
                      />
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₱</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={input.capitalPrice || ""}
                          onChange={(e) => updateBatchItem(item, "capitalPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-700 rounded pl-5 pr-2 py-1.5 text-sm text-gray-300 focus:border-blue-500/50 outline-none"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={input.notes}
                        onChange={(e) => updateBatchItem(item, "notes", e.target.value)}
                        placeholder="Optional remarks..."
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-gray-300 focus:border-blue-500/50 outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No items found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/80 flex justify-between items-center backdrop-blur-md">
           <div className="text-sm text-gray-400">
             {Object.keys(batchData).filter(k => batchData[k].addQuantity > 0).length} items selected for update
           </div>
           
           <div className="flex gap-3">
             <button
               onClick={onClose}
               disabled={isSubmitting}
               className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
             >
               Cancel
             </button>
             <button
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all font-semibold"
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Processing {progress ? `${progress.current}/${progress.total}` : "..."}
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4" />
                   Confirm Batch Update
                 </>
               )}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
