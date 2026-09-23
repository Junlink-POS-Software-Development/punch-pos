"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PosFormValues } from "../../utils/posSchema";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { useCategories } from "@/app/inventory/hooks/useCategories";
import {
  ShoppingBag,
  Search,
  Check,
  Plus,
  X,
  Keyboard,
  Package,
  Tag,
  Scale,
  Layers,
  Sparkles,
} from "lucide-react";

import { QuickPickGrid } from "../action-panel/quickpick-grid/QuickPickGrid";

interface RetailProductSearchHubProps {
  onSelectItem: (item: { sku: string; itemName: string }) => void;
  onAddToCartDirect?: (item: any) => void;
  onToggleShortcuts?: () => void;
  showShortcutsToggle?: boolean;
}

export const RetailProductSearchHub: React.FC<RetailProductSearchHubProps> = ({
  onSelectItem,
  onAddToCartDirect,
  onToggleShortcuts,
  showShortcutsToggle = true,
}) => {
  const { watch, setValue } = useFormContext<PosFormValues>();
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();
  const { categories } = useCategories();

  const currentBarcode = watch("barcode") || "";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [idleViewTab, setIdleViewTab] = useState<"directory" | "quickpick">("directory");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Helper: map category_id to human-readable category name
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => {
      const catName = cat.category || (cat as any).name;
      if (cat.id && catName) {
        map.set(cat.id, catName);
      }
    });
    return map;
  }, [categories]);

  // Helper to get stock quantity from inventory data
  const getStock = (sku: string) => {
    const inv = inventoryData?.find((i) => i.sku === sku);
    return inv?.current_stock ?? 0;
  };

  const hasQuery = Boolean(currentBarcode && currentBarcode.trim().length > 0);

  // Extract unique categories available in items for filter pills
  const availableCategories = useMemo(() => {
    const categoryCounts = new Map<string, { id: string; name: string; count: number }>();

    allItems.forEach((item) => {
      const catId = item.category || (item as any).categoryId || "uncategorized";
      const catName =
        item.categoryName || categoryMap.get(catId) || (catId === "uncategorized" ? "Other" : catId);

      const existing = categoryCounts.get(catId);
      if (existing) {
        existing.count += 1;
      } else {
        categoryCounts.set(catId, { id: catId, name: catName, count: 1 });
      }
    });

    return Array.from(categoryCounts.values()).sort((a, b) => b.count - a.count);
  }, [allItems, categoryMap]);

  // Search Results matching the query in barcode field
  const searchResults = useMemo(() => {
    const cleanQuery = currentBarcode.toLowerCase().trim();

    // Base items filtered by query
    let list = allItems;
    if (cleanQuery) {
      list = allItems
        .map((item) => {
          const name = (item.itemName || "").toLowerCase();
          const sku = (item.sku || "").toLowerCase();
          const catId = item.category || (item as any).categoryId || "";
          const catName = (
            item.categoryName ||
            categoryMap.get(catId) ||
            catId
          ).toLowerCase();
          const desc = (item.description || "").toLowerCase();
          const packBarcode = ((item as any).packBarcode || "").toLowerCase();

          let score = 0;
          if (sku === cleanQuery) score += 100;
          else if (sku.startsWith(cleanQuery)) score += 80;
          else if (packBarcode === cleanQuery) score += 95;
          else if (name === cleanQuery) score += 90;
          else if (name.startsWith(cleanQuery)) score += 70;
          else if (name.includes(cleanQuery)) score += 50;
          else if (sku.includes(cleanQuery)) score += 40;
          else if (catName.includes(cleanQuery)) score += 30;
          else if (desc.includes(cleanQuery)) score += 20;

          return { item, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item);
    }

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((item) => {
        const catId = item.category || (item as any).categoryId || "uncategorized";
        return catId === selectedCategory;
      });
    }

    return list;
  }, [currentBarcode, allItems, selectedCategory, categoryMap]);

  // Reset highlight when search or category changes
  useEffect(() => {
    setHighlightedIndex(searchResults.length > 0 ? 0 : -1);
  }, [currentBarcode, selectedCategory, searchResults.length]);

  // Keyboard navigation listener (dispatched from ItemAutoComplete)
  useEffect(() => {
    const handleNavEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      const key = customEvent.detail?.key;

      if (!key || searchResults.length === 0) return;

      if (key === "ArrowDown") {
        setHighlightedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
      } else if (key === "ArrowUp") {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
      } else if (key === "Enter") {
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          customEvent.preventDefault();
          const target = searchResults[highlightedIndex];
          handleSelectItem(target);
        }
      }
    };

    window.addEventListener("retail-search-nav", handleNavEvent);
    window.addEventListener("terminal-search-nav", handleNavEvent);
    return () => {
      window.removeEventListener("retail-search-nav", handleNavEvent);
      window.removeEventListener("terminal-search-nav", handleNavEvent);
    };
  }, [searchResults, highlightedIndex]);

  // Auto-scroll highlighted row into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listContainerRef.current) {
      const el = listContainerRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedIndex]);

  // Selection handlers
  const handleSelectItem = (item: (typeof allItems)[0]) => {
    setValue("barcode", item.sku, { shouldValidate: true });
    onSelectItem({ sku: item.sku, itemName: item.itemName });
  };

  const handleAddDirect = (item: (typeof allItems)[0]) => {
    setValue("barcode", item.sku, { shouldValidate: true });
    setValue("quantity", 1);
    if (onAddToCartDirect) {
      onAddToCartDirect(item);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-2.5 sm:p-3 shadow-sm h-full max-h-full min-h-0 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider truncate">
              {hasQuery
                ? `Product Search Results (${searchResults.length})`
                : `Product Catalog & Quick Directory (${allItems.length})`}
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 shrink-0 font-semibold">
                Retail Catalog
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {hasQuery
                ? `Showing products matching "${currentBarcode}"`
                : "Type in search above or click any product to quickly select/add"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {hasQuery && (
            <button
              type="button"
              onClick={() => setValue("barcode", "")}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {showShortcutsToggle && onToggleShortcuts && (
            <button
              type="button"
              onClick={onToggleShortcuts}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors border border-border cursor-pointer"
              title="Switch to Keyboard Shortcuts Guide"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shortcuts</span>
            </button>
          )}
        </div>
      </div>

      {/* Idle View Mode Switcher (only shown when not actively searching) */}
      {!hasQuery && (
        <div className="flex items-center justify-between text-[11px] pt-1.5 pb-1 px-0.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-muted/60 p-0.5 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setIdleViewTab("directory")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                idleViewTab === "directory"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-primary" />
              <span>All Products ({allItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setIdleViewTab("quickpick")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                idleViewTab === "quickpick"
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Pick</span>
            </button>
          </div>

          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            {idleViewTab === "quickpick"
              ? "Tap touch tiles to select • Type barcode to search"
              : "Filter by category or click to add"}
          </span>
        </div>
      )}

      {/* Quick Pick Grid View (When idle and Quick Pick tab selected) */}
      {!hasQuery && idleViewTab === "quickpick" ? (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col pt-1">
          <QuickPickGrid onSelect={handleSelectItem} />
        </div>
      ) : (
        <>
          {/* Category Filter Chips Bar */}
          <div className="flex items-center gap-1.5 py-2 overflow-x-auto shrink-0 text-[11px] custom-scrollbar">
            <span className="text-muted-foreground font-semibold shrink-0 mr-1 text-[10px] uppercase tracking-wider">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({allItems.length})
            </button>

            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          {/* Results / Catalog List */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {searchResults.length > 0 ? (
          <div
            ref={listContainerRef}
            className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar"
          >
            {searchResults.map((item, index) => {
              const stock = getStock(item.sku);
              const price = item.sellingPrice ?? item.salesPrice ?? 0;
              const isHighlighted = index === highlightedIndex;
              const catId = item.category || (item as any).categoryId || "";
              const catName = item.categoryName || categoryMap.get(catId);
              const isWeighed = (item as any).isWeighed || (item as any).is_weighed;
              const unitOfMeasure = (item as any).unitOfMeasure || (item as any).unit_of_measure || "kg";
              const packQuantity = (item as any).packQuantity || (item as any).pack_quantity;

              return (
                <div
                  key={item.id || item.sku}
                  onClick={() => setHighlightedIndex(index)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-150 gap-2 ${
                    isHighlighted
                      ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                      : "border-border/80 bg-card hover:bg-muted/50 hover:border-primary/40"
                  }`}
                >
                  {/* Left: Product Icon & Metadata */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center shrink-0 text-muted-foreground">
                      {isWeighed ? (
                        <Scale className="w-4 h-4 text-amber-500" />
                      ) : packQuantity ? (
                        <Layers className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Package className="w-4 h-4 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">
                          {item.itemName}
                        </span>

                        {catName && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50">
                            {catName}
                          </span>
                        )}

                        {isWeighed && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            ⚖️ Weighed ({unitOfMeasure})
                          </span>
                        )}

                        {packQuantity && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                            📦 Pack of {packQuantity}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span className="font-mono text-[11px] text-muted-foreground/80">
                          SKU: {item.sku}
                        </span>
                        {item.description && (
                          <span className="truncate max-w-[200px] text-[11px] opacity-75">
                            • {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price, Stock & Selector Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="text-left sm:text-right">
                      <span className="font-mono font-black text-sm text-foreground block">
                        ₱{price.toFixed(2)}
                        {isWeighed && (
                          <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                            /{unitOfMeasure}
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] font-bold block ${
                          stock > 5
                            ? "text-muted-foreground"
                            : stock > 0
                            ? "text-amber-600 dark:text-amber-400 font-extrabold"
                            : "text-destructive font-black"
                        }`}
                      >
                        {stock > 0 ? `Stocks: ${stock}` : "Out of stock"}
                      </span>
                    </div>

                    {/* Selector Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-primary/20"
                        title="Select item into transaction form"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select</span>
                      </button>

                      {onAddToCartDirect && (
                        <button
                          type="button"
                          onClick={() => handleAddDirect(item)}
                          disabled={stock <= 0}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                          title={stock > 0 ? "Direct 1-click add to cart" : "Out of stock"}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl my-auto">
            <Search className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
            <p className="font-bold text-foreground">
              {hasQuery
                ? `No products found matching "${currentBarcode}"`
                : "No products available in this category"}
            </p>
            <p className="text-[11px] opacity-75 mt-1">
              {hasQuery
                ? "Try searching by product name, SKU, barcode, or category."
                : "Select a different category or register new items in Inventory."}
            </p>
            {(hasQuery || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setValue("barcode", "");
                  setSelectedCategory("all");
                }}
                className="mt-3 px-3 py-1 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Clear Filters & Show All
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )}
</div>
  );
};
