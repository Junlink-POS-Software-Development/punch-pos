"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { PosFormValues } from "../../utils/posSchema";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import {
  extractPharmacyMeta,
  findGenericEquivalents,
  PharmacyMeta,
} from "@/lib/utils/pharmacyMeta";
import {
  Pill,
  ArrowRightLeft,
  Plus,
  Check,
  Search,
  Keyboard,
  CheckCircle2,
  TrendingDown,
  X,
  Package,
  Layers,
} from "lucide-react";

interface PharmacyEquivalentsHubProps {
  onSelectItem: (item: { sku: string; itemName: string }) => void;
  onAddToCartDirect?: (item: any) => void;
  onToggleShortcuts?: () => void;
  showShortcutsToggle?: boolean;
}

export const PharmacyEquivalentsHub: React.FC<PharmacyEquivalentsHubProps> = ({
  onSelectItem,
  onAddToCartDirect,
  onToggleShortcuts,
  showShortcutsToggle = true,
}) => {
  const { watch, setValue } = useFormContext<PosFormValues>();
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();

  const currentBarcode = watch("barcode") || "";
  const [filterType, setFilterType] = useState<"all" | "generic" | "branded" | "rx">("all");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isManualSearch, setIsManualSearch] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Helper to get stock quantity from inventory data
  const getStock = (sku: string) => {
    const inv = inventoryData?.find((i) => i.sku === sku);
    return inv?.current_stock ?? 0;
  };

  // Check if currentBarcode exactly matches an item's SKU
  const exactItem = useMemo(() => {
    if (!currentBarcode || !currentBarcode.trim()) return null;
    const clean = currentBarcode.trim().toLowerCase();
    return allItems.find((item) => item.sku.toLowerCase() === clean) || null;
  }, [currentBarcode, allItems]);

  const exactMeta = useMemo(() => {
    if (!exactItem) return null;
    return extractPharmacyMeta(exactItem);
  }, [exactItem]);

  // Find all generic equivalents sharing the same active molecule if an exact item is selected
  const equivalents = useMemo(() => {
    if (!exactItem) return [];
    return findGenericEquivalents(exactItem, allItems);
  }, [exactItem, allItems]);

  // Search Results matching the query in barcode field
  const rawSearchResults = useMemo(() => {
    if (!currentBarcode || !currentBarcode.trim()) return [];
    const query = currentBarcode.toLowerCase().trim();

    return allItems.filter((item) => {
      const meta = extractPharmacyMeta(item);
      const nameMatch = item.itemName.toLowerCase().includes(query);
      const skuMatch = item.sku.toLowerCase().includes(query);
      const genMatch = meta.genericName ? meta.genericName.toLowerCase().includes(query) : false;
      const dosageMatch = meta.dosage ? meta.dosage.toLowerCase().includes(query) : false;
      const formMatch = meta.formulation ? meta.formulation.toLowerCase().includes(query) : false;
      const descMatch = item.description ? item.description.toLowerCase().includes(query) : false;
      return nameMatch || skuMatch || genMatch || dosageMatch || formMatch || descMatch;
    });
  }, [currentBarcode, allItems]);

  // Apply tab filters (all, generic, branded, rx)
  const filteredSearchResults = useMemo(() => {
    if (filterType === "all") return rawSearchResults;
    return rawSearchResults.filter((item) => {
      const meta = extractPharmacyMeta(item);
      if (filterType === "generic") return meta.brandType === "generic";
      if (filterType === "branded") return meta.brandType === "branded";
      if (filterType === "rx") return meta.isRx === true;
      return true;
    });
  }, [rawSearchResults, filterType]);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(filteredSearchResults.length > 0 ? 0 : -1);
  }, [currentBarcode, filterType, filteredSearchResults.length]);

  // Keyboard navigation listener (dispatched from ItemAutoComplete)
  useEffect(() => {
    const handleNavEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      const key = customEvent.detail?.key;

      if (!key || filteredSearchResults.length === 0) return;

      if (key === "ArrowDown") {
        setHighlightedIndex((prev) => (prev < filteredSearchResults.length - 1 ? prev + 1 : 0));
      } else if (key === "ArrowUp") {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSearchResults.length - 1));
      } else if (key === "Enter") {
        if (highlightedIndex >= 0 && highlightedIndex < filteredSearchResults.length) {
          customEvent.preventDefault();
          const target = filteredSearchResults[highlightedIndex];
          handleSelectItem(target);
        }
      }
    };

    window.addEventListener("pharmacy-search-nav", handleNavEvent);
    return () => window.removeEventListener("pharmacy-search-nav", handleNavEvent);
  }, [filteredSearchResults, highlightedIndex]);

  // Auto-scroll highlighted row into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listContainerRef.current) {
      const el = listContainerRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedIndex]);

  // Selection handlers
  const handleSelectItem = (item: (typeof allItems)[0]) => {
    setIsManualSearch(false);
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

  // Determine active view mode:
  // 1. 'equivalents': exact item matched and user is not in manual search mode
  // 2. 'results': query has results and (no exact item OR user wants to see results)
  // 3. 'empty': query has 0 results
  // 4. 'idle': currentBarcode is empty
  const hasQuery = Boolean(currentBarcode && currentBarcode.trim().length > 0);
  const showEquivalentsView = Boolean(exactItem && !isManualSearch);
  const showSearchResultsView = Boolean(hasQuery && (!exactItem || isManualSearch));

  return (
    <div className="bg-card border border-border rounded-2xl p-2.5 sm:p-3 shadow-sm h-full max-h-full min-h-0 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Pill className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider truncate">
              {showEquivalentsView
                ? "Generic Equivalents & Alternatives"
                : showSearchResultsView
                ? `Medicine Search Results (${filteredSearchResults.length})`
                : "Pharmacy Medicine Directory"}
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                RA 6675
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {showEquivalentsView
                ? "Philippine Generics Act • Compare prices & offer affordable alternatives"
                : showSearchResultsView
                ? `Showing medicines matching "${currentBarcode}"`
                : "Search by Brand Name, Generic Molecule, Dosage, or Formulation"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {showEquivalentsView && rawSearchResults.length > 1 && (
            <button
              type="button"
              onClick={() => setIsManualSearch(true)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20 cursor-pointer"
              title="Show all matching search results"
            >
              <Search className="w-3 h-3" />
              <span>All Results ({rawSearchResults.length})</span>
            </button>
          )}

          {hasQuery && (
            <button
              type="button"
              onClick={() => {
                setValue("barcode", "");
                setIsManualSearch(false);
              }}
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

      {/* SEARCH RESULTS LIST VIEW */}
      {showSearchResultsView && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden py-1.5">
          {/* Filter Chips Bar */}
          {rawSearchResults.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2 pb-1 overflow-x-auto shrink-0 text-[11px]">
              <span className="text-muted-foreground font-semibold shrink-0 mr-1 text-[10px] uppercase tracking-wider">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({rawSearchResults.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("generic")}
                className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  filterType === "generic"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                💊 Generic ({rawSearchResults.filter((i) => extractPharmacyMeta(i).brandType === "generic").length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("branded")}
                className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  filterType === "branded"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                🏷️ Branded ({rawSearchResults.filter((i) => extractPharmacyMeta(i).brandType === "branded").length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("rx")}
                className={`px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  filterType === "rx"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Rx ({rawSearchResults.filter((i) => extractPharmacyMeta(i).isRx).length})
              </button>
            </div>
          )}

          {/* Results List */}
          {filteredSearchResults.length > 0 ? (
            <div
              ref={listContainerRef}
              className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1"
            >
              {filteredSearchResults.map((item, index) => {
                const meta = extractPharmacyMeta(item);
                const stock = getStock(item.sku);
                const price = item.sellingPrice ?? item.salesPrice ?? 0;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={item.id || item.sku}
                    onClick={() => setHighlightedIndex(index)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all duration-150 gap-2 ${
                      isHighlighted
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                        : "border-border/80 bg-card hover:bg-muted/50 hover:border-primary/40"
                    }`}
                  >
                    {/* Left: Metadata */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">
                          {item.itemName}
                        </span>

                        {meta.brandType && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase ${
                              meta.brandType === "generic"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {meta.brandType === "generic" ? "💊 Generic" : "🏷️ Branded"}
                          </span>
                        )}

                        {meta.isRx && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                            Rx
                          </span>
                        )}
                      </div>

                      {/* Molecule, Dosage & Formulation Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1 text-xs">
                        {meta.genericName && (
                          <span className="text-muted-foreground truncate">
                            <span className="opacity-75 font-normal">Molecule:</span>{" "}
                            <strong className="font-semibold text-foreground">{meta.genericName}</strong>
                          </span>
                        )}

                        {/* Dedicated Dosage Badge */}
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border flex items-center gap-0.5 ${
                          meta.dosage
                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30"
                            : "bg-muted text-muted-foreground border-border/50 opacity-60"
                        }`}>
                          <span>Dosage:</span> {meta.dosage || "—"}
                        </span>

                        {meta.formulation && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/15 text-purple-800 dark:text-purple-200 border border-purple-500/30">
                            <span>Form:</span> {meta.formulation}
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-muted-foreground/75 ml-1">
                          SKU: {item.sku}
                        </span>
                      </div>
                    </div>

                    {/* Right: Price, Stock & Selector Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <div className="text-left sm:text-right">
                        <span className="font-mono font-black text-sm text-foreground block">
                          ₱{price.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-bold block ${
                            stock > 0 ? "text-muted-foreground" : "text-destructive"
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
              <p className="font-bold text-foreground">No medicines found matching "{currentBarcode}"</p>
              <p className="text-[11px] opacity-75 mt-1">
                Try searching by Generic Molecule (e.g. Paracetamol), strength (e.g. 500mg), or dosage form (e.g. Syrup).
              </p>
              <button
                type="button"
                onClick={() => setValue("barcode", "")}
                className="mt-3 px-3 py-1 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Clear Search & Browse All
              </button>
            </div>
          )}
        </div>
      )}

      {/* EXACT SELECTED MEDICINE & RA 6675 EQUIVALENTS VIEW */}
      {showEquivalentsView && exactItem && (
        <div className="flex-1 min-h-0 overflow-y-auto py-1.5 space-y-2.5 pr-1">
          {/* Active Selected Medicine Card */}
          <div className="flex items-center justify-between text-xs bg-muted/40 p-2.5 rounded-xl border border-border/60">
            <div className="truncate pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">{exactItem.itemName}</span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.2 rounded ${
                    exactMeta?.brandType === "generic"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {exactMeta?.brandType === "generic" ? "💊 Generic" : "🏷️ Branded"}
                </span>
                {exactMeta?.isRx && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                    Rx
                  </span>
                )}
              </div>
              {exactMeta?.genericName && (
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  Molecule: <strong className="text-primary">{exactMeta.genericName}</strong>
                  {exactMeta.dosage ? ` • ${exactMeta.dosage}` : ""}
                  {exactMeta.formulation ? ` • ${exactMeta.formulation}` : ""}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="font-mono font-bold text-foreground text-sm block">
                  ₱{(exactItem.sellingPrice ?? exactItem.salesPrice ?? 0).toFixed(2)}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Stocks: {getStock(exactItem.sku)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue("barcode", "");
                  setIsManualSearch(true);
                }}
                className="px-2 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-border transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>

          {/* List of Equivalent Medicines */}
          {equivalents.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-1">
                <span>Found {equivalents.length} alternative(s) in inventory:</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Generics & lower cost options first
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {equivalents.map((alt) => {
                  const altSku = alt.sku || "";
                  const altItem = alt as any;
                  const altDisplayName = alt.displayName || altItem.itemName || altItem.item_name || "Medicine";
                  const altStock = getStock(altSku);
                  const price = altItem.sellingPrice ?? altItem.salesPrice ?? altItem.sales_price ?? 0;

                  return (
                    <div
                      key={altSku || alt.id}
                      className="flex flex-col justify-between p-2.5 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-foreground truncate">
                              {altDisplayName}
                            </span>
                            <span
                              className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                                alt.meta.brandType === "generic"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {alt.meta.brandType === "generic" ? "Generic" : "Branded"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                              Dosage: {alt.meta.dosage || "—"}
                            </span>
                            {alt.meta.formulation && (
                              <span className="text-[10px] text-muted-foreground">
                                • {alt.meta.formulation}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-xs text-foreground block">
                            ₱{price.toFixed(2)}
                          </span>
                          {alt.isCheaper && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-0.5">
                              <TrendingDown className="w-2.5 h-2.5" />
                              Save ₱{alt.savings.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40">
                        <span
                          className={`text-[10px] font-bold ${
                            altStock > 0 ? "text-muted-foreground" : "text-destructive"
                          }`}
                        >
                          Stocks: {altStock}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectItem({ sku: altSku, itemName: altDisplayName });
                            if (onAddToCartDirect && altStock > 0) {
                              onAddToCartDirect(alt);
                            }
                          }}
                          className="px-2 py-0.8 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-2.5 h-2.5" />
                          <span>Switch</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              <p>No other generic brands or unbranded equivalents found for this molecule.</p>
              <p className="text-[10px] opacity-75 mt-0.5">
                Register generic alternatives in Inventory to enable price substitution comparisons.
              </p>
            </div>
          )}
        </div>
      )}

      {/* IDLE / MEDICINE DIRECTORY VIEW */}
      {!hasQuery && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden py-1.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-1 shrink-0">
            <span>Fast Selection • Available Medicines ({allItems.length}):</span>
            <span className="text-[10px]">Type in search or select directly below</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
            {allItems.slice(0, 10).map((item) => {
              const meta = extractPharmacyMeta(item);
              const stock = getStock(item.sku);
              const price = item.sellingPrice ?? item.salesPrice ?? 0;

              return (
                <div
                  key={item.id || item.sku}
                  className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/70 hover:border-primary/40 hover:bg-muted/30 transition-all"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-xs text-foreground truncate">{item.itemName}</span>
                      {meta.brandType && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase ${
                            meta.brandType === "generic"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {meta.brandType === "generic" ? "Generic" : "Branded"}
                        </span>
                      )}
                      {meta.isRx && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-red-500/15 text-red-600 dark:text-red-400">
                          Rx
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] mt-0.5">
                      {meta.genericName ? (
                        <span className="font-semibold text-foreground/80 truncate max-w-[120px]">{meta.genericName}</span>
                      ) : null}
                      <span className="px-1.5 py-0.2 rounded font-bold bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                        Dosage: {meta.dosage || "—"}
                      </span>
                      {meta.formulation ? (
                        <span className="text-muted-foreground">Form: {meta.formulation}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-foreground block">
                        ₱{price.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-muted-foreground block">
                        Stock: {stock}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="px-2 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Select
                    </button>

                    {onAddToCartDirect && (
                      <button
                        type="button"
                        onClick={() => handleAddDirect(item)}
                        disabled={stock <= 0}
                        className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
                        title="1-click add"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Notice */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground shrink-0">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          List-Based Selection Active
        </span>
        <span>Philippine Generics Act (RA 6675)</span>
      </div>
    </div>
  );
};
