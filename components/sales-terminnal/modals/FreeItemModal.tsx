"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Search, Package } from "lucide-react";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import { useItems } from "@/app/inventory/hooks/useItems";
import ErrorMessage from "../components/ErrorMessage";

interface FreeItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: Item, quantity: number) => void;
}

export const FreeItemModal = ({ isOpen, onClose, onSelect }: FreeItemModalProps) => {
  const { items, isLoading } = useItems();
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  const qtyInputRef = React.useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
        return [];
    }
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(lowerSearch) ||
        item.sku.toLowerCase().includes(lowerSearch)
    );
  }, [items, searchTerm]);

  // Reset highlighted index when search results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, items]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredItems[highlightedIndex];
      if (item) {
        setSelectedItem(item);
        // Small timeout to ensure focus works
        setTimeout(() => qtyInputRef.current?.focus(), 10);
      }
    }
  };

  const handleQtyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!selectedItem) {
        setError("Please select an item first");
        return;
    }

    if (!quantity || quantity <= 0) {
      setError("Quantity should not be zero or empty");
      return;
    }

    onSelect(selectedItem, Number(quantity));
    // Reset states
    setSearchTerm("");
    setQuantity("");
    setSelectedItem(null);
    setHighlightedIndex(0);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-primary">🎁</span> Select Free Item
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 overflow-hidden bg-card">
          {/* Controls: Search + Quantity */}
          <div className="flex gap-2">
            <div className={`relative flex-1 ${selectedItem ? "opacity-50 pointer-events-none" : ""}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                type="text"
                placeholder="Search item..."
                className="w-full bg-muted/30 border border-input text-foreground pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                autoFocus
                disabled={!!selectedItem}
                />
            </div>
            <div className="w-24">
                <input
                    ref={qtyInputRef}
                    type="number"
                    min="1"
                    placeholder="Qty"
                    className="w-full h-full bg-muted/30 border border-input text-foreground text-center font-bold text-lg rounded-xl focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary"
                    value={quantity}
                    onChange={(e) => {
                        const val = e.target.value === "" ? "" : parseInt(e.target.value);
                        setQuantity(val);
                    }}
                    onKeyDown={handleQtyKeyDown}
                    disabled={!selectedItem}
                />
            </div>
          </div>

          {/* Selected Item Notification */}
          {selectedItem && (
              <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                          Selected: <span className="font-bold">{selectedItem.itemName}</span>
                      </span>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                      Change
                  </button>
              </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto min-h-[300px] flex flex-col gap-2">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading items...</div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                      setSelectedItem(item);
                      setTimeout(() => qtyInputRef.current?.focus(), 10);
                  }}
                  className={`flex items-center justify-between p-3 border rounded-xl transition-all group text-left
                    ${highlightedIndex === index 
                        ? "bg-primary/20 border-primary shadow-sm" 
                        : "bg-muted/50 border-border hover:bg-primary/10 hover:border-primary/50"}
                  `}
                >
                  <div>
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.itemName}
                    </div>
                    <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                  </div>
                  <div className="text-primary font-bold">FREE</div>
                </button>
              ))
            ) : (
                searchTerm ? (
                     <div className="text-center text-muted-foreground py-8">No items found.</div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">Type to search for items</div>
                )
             
            )}
          </div>
        </div>

        <ErrorMessage message={error} onClose={() => setError(null)} />
      </div>
    </div>
  );
};
