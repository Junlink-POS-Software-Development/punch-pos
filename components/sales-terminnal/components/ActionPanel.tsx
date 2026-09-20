import React from "react";
import { useFormContext } from "react-hook-form";
import { QuickPickGrid } from "./action-panel/quickpick-grid/QuickPickGrid";
import { ActionButtons } from "./action-panel/ActionButtons";
import { Numpad } from "./action-panel/Numpad";
import { PosFormValues } from "../utils/posSchema";

interface ActionPanelProps {
  onAddToCart: () => void;
  onClearAll: () => void;
  onCharge: () => void;
  onDiscount: () => void;
  onVoucher: () => void;
  activeField: "customerName" | "barcode" | "quantity" | "freeSearch" | "freeQty" | null;
  setActiveField: (field: "customerName" | "barcode" | "quantity" | "freeSearch" | "freeQty" | null) => void;
  // [NEW] Free Mode
  isFreeMode?: boolean;
  onToggleFreeMode?: () => void;
  // Restaurant actions
  onSendKitchen?: () => void;
  onSplitCheck?: () => void;
  onOpenTableModal?: () => void;
}

export function ActionPanel({
  onAddToCart,
  onClearAll,
  onCharge,
  onDiscount,
  onVoucher,
  activeField,
  setActiveField,
  isFreeMode,
  onToggleFreeMode,
  onSendKitchen,
  onSplitCheck,
  onOpenTableModal,
}: ActionPanelProps) {
  const { setValue, getValues } = useFormContext<PosFormValues>();

  const handleQuickPickSelect = (item: any) => {
    console.log("Selected:", item);
    setValue("barcode", item.sku, { shouldValidate: true });
        setActiveField("quantity");
  };

  const handleNumpadPress = (key: string) => {
    // Attempt global dispatch first
    const event = new CustomEvent("virtual-keypress", { detail: { key }, cancelable: true });
    if (!window.dispatchEvent(event)) {
      // Handled by an isolated component (like FreeItemModal)
      return;
    }

    if (!activeField) return;

    if (key === " ") key = " "; // Normal space

    if (key === "Enter") {
      onAddToCart();
      setActiveField("barcode");
      return;
    }

    const currentValue = getValues(activeField as any);
    
    let newValue: string | number = "";
    if (key === "Backspace") {
      newValue = currentValue ? String(currentValue).slice(0, -1) : "";
    } else {
      newValue = currentValue ? String(currentValue) + key : key;
    }

    if (activeField === "quantity") {
      setValue(activeField as any, Number(newValue), { shouldValidate: true });
    } else {
      setValue(activeField as any, String(newValue), { shouldValidate: true });
    }
  };

  const handleClearInput = () => {
    const event = new CustomEvent("virtual-keyclear", { cancelable: true });
    if (!window.dispatchEvent(event)) {
      return;
    }

    if (activeField) {
        setValue(activeField as any, activeField === "quantity" ? 0 : "");
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
    <div className="flex flex-col bg-card border-l border-border h-full w-full overflow-hidden shadow-sm p-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-foreground font-lexend font-medium text-base sm:text-lg">Action Panel</h2>
      </div>

      {/* 1. Quick Pick Grid - scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <QuickPickGrid onSelect={handleQuickPickSelect} />
      </div>

      {/* 2. Action Buttons */}
      <div className="shrink-0 mt-2">
         <ActionButtons 
            onAdd={onAddToCart}
            onDiscount={onDiscount}
            onVoucher={onVoucher}
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
            onSendKitchen={onSendKitchen}
            onSplitCheck={onSplitCheck}
            onOpenTableModal={onOpenTableModal}
         />
      </div>

      {/* 3. Numpad — always tablet mode (virtual keyboard default with numpad toggle) */}
      <div className="flex flex-col shrink-0 mt-2 min-h-[260px]">
         <Numpad onKeyPress={handleNumpadPress} onClear={handleClearInput} isTabletMode={true} />
      </div>
    </div>
  );
}
