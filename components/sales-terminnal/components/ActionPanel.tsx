import React from "react";
import { useFormContext } from "react-hook-form";
import { ActionButtons } from "./action-panel/ActionButtons";
import { Numpad } from "./action-panel/Numpad";
import { PosFormValues } from "../utils/posSchema";

interface ActionPanelProps {
  cart?: React.ReactNode;
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
  // Grocery actions
  onOpenScaleModal?: () => void;
}

export function ActionPanel({
  cart,
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
  onOpenScaleModal,
}: ActionPanelProps) {
  const { setValue, getValues } = useFormContext<PosFormValues>();

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
    <div className="flex flex-col bg-card border-l border-border h-full w-full overflow-hidden shadow-sm p-2 sm:p-2.5 gap-2">
      {/* 1. Terminal Cart Table (above keyboard) */}
      {cart && (
        <div className="flex-1 min-h-0 overflow-hidden border border-border bg-card rounded-2xl shadow-xs">
          {cart}
        </div>
      )}

      {/* 2. Virtual Keyboard Area with Squeezed Quick Action Buttons */}
      <div className="shrink-0 flex flex-col gap-2 bg-muted/20 border border-border/80 rounded-2xl p-2 sm:p-2.5 shadow-xs">
        <ActionButtons 
          compact={true}
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
          onOpenScaleModal={onOpenScaleModal}
        />

        <Numpad onKeyPress={handleNumpadPress} onClear={handleClearInput} isTabletMode={true} />
      </div>
    </div>
  );
}
