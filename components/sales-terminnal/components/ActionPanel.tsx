"use client";

import React from "react";
import { QuickPickGrid } from "./action-panel/QuickPickGrid";
import { ActionButtons } from "./action-panel/ActionButtons";
import { Numpad } from "./action-panel/Numpad";
import { CustomerIntelligence } from "./action-panel/CustomerIntelligence";

// Placeholder data for buttons
const ACTION_BUTTONS = [
  { label: "LARGE COFFEE", color: "bg-amber-700/50 text-amber-100 border-amber-600/50" },
  { label: "PLASTIC BAG", color: "bg-yellow-700/50 text-yellow-100 border-yellow-600/50" },
  { label: "SERVICES", color: "bg-cyan-700/50 text-cyan-100 border-cyan-600/50" },
  { label: "PROMO ITEMS", color: "bg-emerald-700/50 text-emerald-100 border-emerald-600/50" },
  { label: "PROMO ITEMS", color: "bg-yellow-700/50 text-yellow-100 border-yellow-600/50" },
  { label: "PROMO ITEMS", color: "bg-rose-700/50 text-rose-100 border-rose-600/50" },
  { label: "PHIE COFFEE PRICES", color: "bg-orange-700/50 text-orange-100 border-orange-600/50" },
  { label: "PIRK COFFEE DEXCING", color: "bg-purple-700/50 text-purple-100 border-purple-600/50" },
  { label: "DISCOUNT", color: "bg-red-700/50 text-red-100 border-red-600/50" },
  { label: "DAILY PROMO ITEMS", color: "bg-red-700/50 text-red-100 border-red-600/50" },
  { label: "DAILY COFFEE BAG", color: "bg-sky-700/50 text-sky-100 border-sky-600/50" },
  { label: "+ADD MODIFIER", color: "bg-slate-700/50 text-slate-100 border-slate-600/50" },
];

export default function ActionPanel() {
  const handleQuickPickSelect = (item: any) => {
    console.log("Selected:", item);
  };

  const handleNumpadPress = (key: string) => {
    console.log("Numpad:", key);
  };

  const handleClear = () => {
    console.log("Clear");
  };

  return (
    <div className="flex flex-col h-full bg-[#0F172A] border-l border-slate-800 p-4 gap-4 w-[450px] shrink-0">
      <h2 className="text-white font-lexend font-medium text-lg">Action Panel</h2>

      {/* 1. Quick Pick Grid */}
      <div className="flex-1 min-h-0 flex flex-col">
        <label className="text-xs text-slate-400 font-bold mb-2">Quick Pick</label>
        <QuickPickGrid items={ACTION_BUTTONS} onSelect={handleQuickPickSelect} />
      </div>

      {/* 2. Action Buttons */}
      <div className="shrink-0">
         <ActionButtons 
            onAdd={() => console.log("Add")}
            onDiscount={() => console.log("Discount")}
            onVoucher={() => console.log("Voucher")}
            onOpenDrawer={() => console.log("Open Drawer")}
            onCharge={() => console.log("Charge")}
            onIncreaseQty={() => console.log("Increase Qty")}
            onDecreaseQty={() => console.log("Decrease Qty")}
         />
      </div>

      {/* 3. Numpad & Customer Intelligence */}
      <div className="grid grid-cols-2 gap-4 h-[220px] shrink-0">
         {/* Numpad */}
         <div className="flex flex-col h-full">
            <Numpad onKeyPress={handleNumpadPress} onClear={handleClear} />
         </div>

         {/* Customer Intelligence */}
         <div className="flex flex-col h-full justify-end">
            <CustomerIntelligence />
         </div>
      </div>
    </div>
  );
}
