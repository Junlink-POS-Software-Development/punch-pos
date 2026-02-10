import React from "react";
import { useFormContext } from "react-hook-form";
import { QuickPickGrid } from "./action-panel/quickpick-grid/QuickPickGrid";
import { ActionButtons } from "./action-panel/ActionButtons";
import { Numpad } from "./action-panel/Numpad";
import { CustomerIntelligence } from "./action-panel/CustomerIntelligence";
import { PosFormValues } from "../utils/posSchema";
import { ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Settings } from "lucide-react";

interface ActionPanelProps {
  onAddToCart: () => void;
  onClearAll: () => void;
  onCharge: () => void;
  activeField: "barcode" | "quantity" | null;
  setActiveField: (field: "barcode" | "quantity" | null) => void;
  // [NEW] Free Mode
  isFreeMode?: boolean;
  onToggleFreeMode?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ActionPanel({
  onAddToCart,
  onClearAll,
  onCharge,
  activeField,
  setActiveField,
  isFreeMode,
  onToggleFreeMode,
  isOpen,
  onToggle,
}: ActionPanelProps) {
  const { setValue, getValues } = useFormContext<PosFormValues>();

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
        onClick={onToggle}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-800 border-t border-slate-700 p-3 flex items-center justify-center gap-2 text-white font-medium"
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        {isOpen ? "Hide Actions" : "Show Actions"}
      </button>

      {/* Desktop Toggle Button - Floats on the right side of the screen */}
      <button
        type="button"
        onClick={onToggle}
        className={`
          hidden lg:flex fixed right-6 bottom-24 z-50
          bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--color-primary),0.4)] 
          p-4 rounded-full border-4 border-background transition-all duration-500 ease-in-out
          hover:scale-110 hover:shadow-[0_0_30px_rgba(var(--color-primary),0.6)] active:scale-95
          ${isOpen ? "rotate-180" : "rotate-0"}
        `}
        title={isOpen ? "Collapse Action Panel" : "Expand Action Panel"}
      >
        <Settings className="w-6 h-6 animate-[spin_8s_linear_infinite]" />
      </button>

      {/* Action Panel Container */}
      <div className={`
        flex flex-col bg-card border-l border-border transition-all duration-300 ease-in-out
        w-full lg:w-[450px] shrink-0
        lg:relative lg:h-full
        fixed bottom-12 left-0 right-0 z-30 lg:bottom-auto lg:z-auto
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full lg:translate-x-full lg:translate-y-0 lg:opacity-0 lg:pointer-events-none'}
        max-h-[70vh] lg:max-h-none overflow-y-auto lg:overflow-hidden
        shadow-sm p-4
      `}>
        <div className={`flex items-center justify-between mb-2 ${!isOpen ? 'lg:hidden' : ''}`}>
          <h2 className="text-foreground font-lexend font-medium text-base sm:text-lg">Action Panel</h2>
          <button 
            type="button"
            onClick={onToggle}
            className="hidden lg:block p-2 hover:bg-muted rounded-full text-muted-foreground transition-all duration-300 hover:rotate-90"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

      {/* 1. Quick Pick Grid - scrollable area */}
      <div className={`flex-1 min-h-0 overflow-y-auto ${!isOpen ? 'lg:hidden' : ''}`}>
        <QuickPickGrid onSelect={handleQuickPickSelect} />
      </div>

      {/* 2. Action Buttons */}
      <div className={`shrink-0 mt-3 ${!isOpen ? 'lg:hidden' : ''}`}>
         <ActionButtons 
            onAdd={onAddToCart}
            onDiscount={() => console.log("Discount")}
            onVoucher={() => console.log("Voucher")}
            onOpenDrawer={() => console.log("Open Drawer")} 
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
            isFreeMode={isFreeMode}
            onToggleFreeMode={onToggleFreeMode}
         />
      </div>

      {/* 3. Numpad & Customer Intelligence */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 shrink-0 mt-3 ${!isOpen ? 'lg:hidden' : ''}`}>
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
