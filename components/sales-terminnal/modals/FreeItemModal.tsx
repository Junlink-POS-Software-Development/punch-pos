"use client";

import React, { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import { useItems } from "@/app/inventory/hooks/useItems";

interface FreeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: Item, quantity: number) => void;
}

export const FreeItemModal = ({ isOpen, onClose, onSelect }: FreeItemModalProps) => {
  const { items, isLoading } = useItems();
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(lowerSearch) ||
        item.sku.toLowerCase().includes(lowerSearch)
    );
  }, [items, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-purple-400">🎁</span> Select Free Item
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 overflow-hidden">
          {/* Controls: Search + Quantity */}
          <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                type="text"
                placeholder="Search item..."
                className="w-full bg-slate-950 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                />
            </div>
            <div className="w-24">
                <input
                    type="number"
                    min="1"
                    className="w-full h-full bg-slate-950 border border-slate-700 text-white text-center font-bold text-lg rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto min-h-[300px] flex flex-col gap-2">
            {isLoading ? (
              <div className="text-center text-slate-500 py-8">Loading items...</div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item, quantity)}
                  className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-purple-900/20 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all group text-left"
                >
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                      {item.itemName}
                    </div>
                    <div className="text-xs text-slate-400">SKU: {item.sku}</div>
                  </div>
                  <div className="text-purple-400 font-bold">FREE</div>
                </button>
              ))
            ) : (
                searchTerm ? (
                     <div className="text-center text-slate-500 py-8">No items found.</div>
                ) : (
                    <div className="text-center text-slate-500 py-8">Type to search for items</div>
                )
             
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
