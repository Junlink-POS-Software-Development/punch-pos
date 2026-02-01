import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { QuickPickGrid } from "./action-panel/quickpick-grid/QuickPickGrid";
import { ActionButtons } from "./action-panel/ActionButtons";
import { Numpad } from "./action-panel/Numpad";
import { CustomerIntelligence } from "./action-panel/CustomerIntelligence";
import { PosFormValues } from "../utils/posSchema";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ActionPanelProps {
  onAddToCart: () => void;
  onClearAll: () => void;
  onCharge: () => void;
  activeField: "barcode" | "quantity" | null;
  setActiveField: (field: "barcode" | "quantity" | null) => void;
  // [NEW] Free Mode
  isFreeMode?: boolean;
  onToggleFreeMode?: () => void;
}

export default function ActionPanel({
  onAddToCart,
  onClearAll,
  onCharge,
  activeField,
  setActiveField,
  isFreeMode,
  onToggleFreeMode,
}: ActionPanelProps) {
  const { setValue, getValues, setFocus, reset } = useFormContext<PosFormValues>();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleQuickPickSelect = (item: any) => {
    console.log("Selected:", item);
    setValue("barcode", item.sku, { shouldValidate: true });
    setActiveField("quantity");
  };

  const handleNumpadPress = (key: string) => {
    console.log("Numpad:", key);
    if (!activeField) return;

    const currentValue = getValues(activeField);
    const newValue = currentValue ? String(currentValue) + key : key;

    if (activeField === "quantity") {
      setValue(activeField, Number(newValue), { shouldValidate: true });
    } else {
      setValue(activeField, newValue, { shouldValidate: true });
    }
  };

  const handleClearInput = () => {
    if (activeField) {
        setValue(activeField, activeField === "quantity" ? 0 : "");
    }
  };

  const handleIncreaseQty = () => {
    const currentQty = getValues("quantity") || 0;
    setValue("quantity", currentQty + 1);
  };

  const handleDecreaseQty = () => {
    const currentQty = getValues("quantity") || 0;
    if (currentQty > 1) {
      setValue("quantity", currentQty - 1);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Fixed at bottom on small screens */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-800 border-t border-slate-700 p-3 flex items-center justify-center gap-2 text-white font-medium"
      >
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        {isExpanded ? "Hide Actions" : "Show Actions"}
      </button>

      {/* Action Panel Container */}
      <div className={`
        flex flex-col bg-[#0F172A] border-l border-slate-800 p-2 sm:p-4 gap-3 sm:gap-4
        w-full lg:w-[450px] shrink-0
        lg:relative lg:h-full
        fixed bottom-12 left-0 right-0 z-30 lg:bottom-auto lg:z-auto
        transition-transform duration-300 ease-in-out
        ${isExpanded ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        max-h-[70vh] lg:max-h-none overflow-y-auto lg:overflow-visible
      `}>
        <h2 className="text-white font-lexend font-medium text-base sm:text-lg">Action Panel</h2>

      {/* 1. Quick Pick Grid */}
      <QuickPickGrid onSelect={handleQuickPickSelect} />

      {/* 2. Action Buttons */}
      <div className="shrink-0">
         <ActionButtons 
            onAdd={onAddToCart}
            onDiscount={() => console.log("Discount")}
            onVoucher={() => console.log("Voucher")}
            onOpenDrawer={() => console.log("Open Drawer")} 
            // We kept onOpenDrawer just in case, but ActionButtons will ignore it if we switch functionality.
            // Actually ActionButtons interface needs Update.
            onCharge={onCharge}
            onIncreaseQty={handleIncreaseQty}
            onDecreaseQty={handleDecreaseQty}
            onClearInput={() => {
              setValue("barcode", "");
              setValue("quantity", null);
              setValue("customerName", null);
              setActiveField("barcode");
            }}
            onClearAll={onClearAll}
            isFreeMode={isFreeMode} // [NEW]
            onToggleFreeMode={onToggleFreeMode} // [NEW]
         />
      </div>

      {/* 3. Numpad & Customer Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 shrink-0">
         {/* Numpad */}
         <div className="flex flex-col h-[200px] sm:h-[220px]">
            <Numpad onKeyPress={handleNumpadPress} onClear={handleClearInput} />
         </div>

         {/* Customer Intelligence - Hidden on mobile to save space */}
         <div className="hidden sm:flex flex-col h-full justify-end">
            <CustomerIntelligence />
         </div>
      </div>
    </div>
    </>
  );
}
