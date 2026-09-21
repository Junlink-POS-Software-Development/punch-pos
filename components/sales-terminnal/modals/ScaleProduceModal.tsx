// components/sales-terminnal/modals/ScaleProduceModal.tsx

"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Scale,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Apple,
  Carrot,
  Leaf,
  Beef,
  Flame,
} from "lucide-react";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";
import {
  COMMON_PRODUCE_PLU_PRESETS,
  STANDARD_TARE_OPTIONS,
  TareOption,
  ProduceItemPreset,
} from "@/lib/types/grocery";
import { calculateNetWeight, calculateWeighedTotal } from "@/lib/utils/scaleBarcode";
import { playWeightCaptured } from "@/lib/utils/scanSounds";

interface ScaleProduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  allItems: Item[];
  onAddWeighedItem: (
    item: Item,
    netWeightKg: number,
    totalPrice: number,
    tareWeightKg: number
  ) => void;
}

export const ScaleProduceModal: React.FC<ScaleProduceModalProps> = ({
  isOpen,
  onClose,
  allItems,
  onAddWeighedItem,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    item: Item;
    plu: string;
    name: string;
    pricePerKg: number;
    unit: string;
  } | null>(null);

  const [grossWeight, setGrossWeight] = useState<number>(0.5); // Default 0.500 kg
  const [grossInputStr, setGrossInputStr] = useState<string>("0.500");
  const [selectedTare, setSelectedTare] = useState<TareOption>(STANDARD_TARE_OPTIONS[1]); // Default 5g produce bag
  const [manualPricePerKg, setManualPricePerKg] = useState<string>("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setSelectedItem(null);
      setGrossWeight(0.5);
      setGrossInputStr("0.500");
    }
  }, [isOpen]);

  // Combine store weighed items and presets
  const availableProduce = useMemo(() => {
    // 1. Find store inventory items that are weighed or have PLU
    const storeWeighed = allItems.filter(
      (it) => it.isWeighed || it.unitOfMeasure === "kg" || it.pluCode
    );

    // Map store items
    const mappedStore = storeWeighed.map((it) => ({
      item: it,
      plu: it.pluCode || it.sku,
      name: it.itemName,
      pricePerKg: it.sellingPrice ?? it.salesPrice ?? 0,
      unit: it.unitOfMeasure || "kg",
      isPreset: false,
    }));

    // 2. Also map standard PLU presets that might not be registered yet as synthetic items
    const mappedPresets = COMMON_PRODUCE_PLU_PRESETS.map((p) => {
      const existingInStore = allItems.find(
        (it) => it.pluCode === p.plu || it.sku === p.plu || it.itemName.toLowerCase().includes(p.name.toLowerCase())
      );

      if (existingInStore) {
        return null; // Already in store list
      }

      // Create fallback synthetic item
      const syntheticItem: Item = {
        id: `preset-${p.plu}`,
        itemName: p.name,
        sku: p.plu,
        pluCode: p.plu,
        sellingPrice: p.defaultPricePerKg,
        salesPrice: p.defaultPricePerKg,
        isWeighed: true,
        unitOfMeasure: p.unit,
        description: `Fresh produce PLU #${p.plu}`,
      };

      return {
        item: syntheticItem,
        plu: p.plu,
        name: p.name,
        pricePerKg: p.defaultPricePerKg,
        unit: p.unit,
        isPreset: true,
      };
    }).filter(Boolean) as any[];

    const combined = [...mappedStore, ...mappedPresets];

    if (!searchQuery.trim()) {
      return combined;
    }

    const q = searchQuery.toLowerCase().trim();
    return combined.filter(
      (p) =>
        p.plu.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q)
    );
  }, [allItems, searchQuery]);

  // Select first item by default if none selected
  useEffect(() => {
    if (isOpen && availableProduce.length > 0 && !selectedItem) {
      setSelectedItem(availableProduce[0]);
    }
  }, [isOpen, availableProduce, selectedItem]);

  const activePricePerKg = useMemo(() => {
    if (manualPricePerKg && !isNaN(parseFloat(manualPricePerKg))) {
      return parseFloat(manualPricePerKg);
    }
    return selectedItem?.pricePerKg || 0;
  }, [selectedItem, manualPricePerKg]);

  const netWeight = useMemo(() => {
    return calculateNetWeight(grossWeight, selectedTare.weightKg);
  }, [grossWeight, selectedTare]);

  const computedTotal = useMemo(() => {
    return calculateWeighedTotal(netWeight, activePricePerKg);
  }, [netWeight, activePricePerKg]);

  const handleGrossChange = (val: string) => {
    setGrossInputStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setGrossWeight(num);
    }
  };

  const adjustGross = (delta: number) => {
    const newWeight = Math.max(0, Math.round((grossWeight + delta) * 1000) / 1000);
    setGrossWeight(newWeight);
    setGrossInputStr(newWeight.toFixed(3));
  };

  const handleKeypadPress = (val: string) => {
    if (val === "clear") {
      setSearchQuery("");
      searchInputRef.current?.focus();
    } else if (val === "backspace") {
      setSearchQuery((prev) => prev.slice(0, -1));
      searchInputRef.current?.focus();
    } else {
      setSearchQuery((prev) => prev + val);
      searchInputRef.current?.focus();
    }
  };

  const handleConfirmAdd = () => {
    if (!selectedItem) return;
    if (netWeight <= 0) return;

    playWeightCaptured();
    onAddWeighedItem(
      selectedItem.item,
      netWeight,
      computedTotal,
      selectedTare.weightKg
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                Weighing Scale & Produce PLU Lookup
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  LIVE SCALE
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter PLU code or select produce, apply container tare, and capture weight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left catalog + Right scale readout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
          {/* LEFT: Produce Catalog & PLU Search (7 cols) */}
          <div className="md:col-span-7 flex flex-col border-r border-border min-h-0 bg-background/50">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type PLU code (e.g. 4011) or produce name..."
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && availableProduce.length > 0) {
                      e.preventDefault();
                      setSelectedItem(availableProduce[0]);
                    }
                  }}
                />
              </div>

              {/* Fast Numeric PLU Keypad */}
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="py-1.5 rounded-lg bg-muted/60 hover:bg-muted font-mono font-bold text-xs text-foreground border border-border/60 transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadPress("backspace")}
                  className="py-1.5 rounded-lg bg-muted/60 hover:bg-muted font-bold text-xs text-amber-600 border border-border/60 transition-colors"
                  title="Backspace"
                >
                  ⌫
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress("clear")}
                  className="py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 font-bold text-xs text-red-500 border border-red-500/20 transition-colors"
                  title="Clear PLU"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Produce Grid */}
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 min-h-[260px] max-h-[420px]">
              {availableProduce.map((p) => {
                const isSelected = selectedItem?.plu === p.plu;
                return (
                  <button
                    key={p.plu}
                    type="button"
                    onClick={() => {
                      setSelectedItem(p);
                      setManualPricePerKg("");
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 text-foreground ring-2 ring-amber-500/30"
                        : "bg-card border-border/70 hover:border-border hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        PLU {p.plu}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-bold line-clamp-1 leading-snug">{p.name}</p>
                      <p className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
                        ₱{p.pricePerKg.toFixed(2)} / {p.unit}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Digital Scale Readout & Tare Engine (5 cols) */}
          <div className="md:col-span-5 p-6 flex flex-col justify-between bg-card">
            <div className="space-y-5">
              {/* Selected Produce Banner */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Active Item (PLU {selectedItem?.plu || "—"})
                  </span>
                  <h4 className="text-sm font-black text-foreground line-clamp-1">
                    {selectedItem ? selectedItem.name : "Select an item from left"}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Rate</span>
                  <p className="text-sm font-mono font-bold text-foreground">
                    ₱{activePricePerKg.toFixed(2)}/kg
                  </p>
                </div>
              </div>

              {/* Digital Scale LED Readout */}
              <div className="p-4 rounded-2xl bg-black border border-amber-500/30 text-amber-400 font-mono shadow-inner space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-500/70 border-b border-amber-500/20 pb-1.5">
                  <span className="uppercase font-bold tracking-wider">ELECTRONIC SCALE</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    STABLE
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-amber-500/60 block">Gross Weight</span>
                    <input
                      type="number"
                      step="0.001"
                      value={grossInputStr}
                      onChange={(e) => handleGrossChange(e.target.value)}
                      className="text-3xl font-black bg-transparent text-amber-300 w-32 outline-none"
                    />
                  </div>
                  <span className="text-sm font-bold text-amber-500/80 uppercase">KG</span>
                </div>

                {/* Simulated scale weight adjustments */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[0.1, 0.25, 0.5, 1.0].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => adjustGross(inc)}
                      className="flex-1 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition-colors"
                    >
                      +{inc}kg
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setGrossWeight(0);
                      setGrossInputStr("0.000");
                    }}
                    className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-bold transition-colors"
                    title="Zero Scale"
                  >
                    Zero
                  </button>
                </div>
              </div>

              {/* Container Tare Options */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                  <span className="uppercase tracking-wider">Container Tare</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    -{selectedTare.weightKg.toFixed(3)} kg
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {STANDARD_TARE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedTare(opt)}
                      className={`p-2 rounded-xl text-left border transition-all text-xs font-semibold ${
                        selectedTare.id === opt.id
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-foreground border-border/70"
                      }`}
                    >
                      <span className="block leading-tight text-[11px]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Net Computation Summary */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Scale Weight:</span>
                  <span className="font-mono font-bold">{grossWeight.toFixed(3)} kg</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Deducted Tare:</span>
                  <span className="font-mono text-amber-600 font-bold">-{selectedTare.weightKg.toFixed(3)} kg</span>
                </div>
                <div className="flex justify-between text-foreground border-t border-border/80 pt-1 font-bold">
                  <span>Billable Net Weight:</span>
                  <span className="font-mono text-primary text-sm">{netWeight.toFixed(3)} kg</span>
                </div>
                <div className="flex justify-between text-foreground border-t border-border/80 pt-1 text-sm font-black">
                  <span>Line Total:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                    ₱{computedTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 px-4 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                disabled={!selectedItem || netWeight <= 0}
                className="w-2/3 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Add to Cart (₱{computedTotal.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
