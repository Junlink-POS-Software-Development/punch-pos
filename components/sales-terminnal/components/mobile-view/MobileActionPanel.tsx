// Mobile Action Panel - QuickPick grid and Action buttons
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Tag, Ticket, Eraser } from "lucide-react";
import { QuickPickGrid } from "../action-panel/quickpick-grid/QuickPickGrid";
import { PosFormValues } from "../../utils/posSchema";

interface MobileActionPanelProps {
  onAddToCart: () => void;
  onCharge: () => void;
  activeField: "barcode" | "quantity" | null;
  setActiveField: (field: "barcode" | "quantity" | null) => void;
  onClearCart?: () => void; // Optional for now, but good to have
}

export const MobileActionPanel = ({
  onAddToCart,
  onCharge,
  activeField,
  setActiveField,
  onClearCart,
}: MobileActionPanelProps) => {
  const { setValue, setFocus } = useFormContext<PosFormValues>();

  const handleQuickPickSelect = (item: any) => {
    setValue("barcode", item.sku, { shouldValidate: true });
    setActiveField("quantity");
  };

  const handleClear = () => {
    setValue("barcode", "");
    setValue("quantity", null);
    setActiveField("barcode");
  };

  const handleClearLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (onClearCart) {
        onClearCart();
    }
  };

  // Long press logic for Clear button
  let pressTimer: NodeJS.Timeout;

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    pressTimer = setTimeout(() => handleClearLongPress(e), 800);
  };

  const endPress = () => {
    clearTimeout(pressTimer);
  };


  return (
    <div className="flex flex-col h-full">
      {/* QuickPick Grid - Main content area */}
      <div className="flex-1 min-h-0 overflow-hidden p-2">
        <QuickPickGrid onSelect={handleQuickPickSelect} />
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="p-2 shrink-0 grid grid-cols-3 gap-2">
        <button
          type="button"
          className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1"
        >
          <Tag className="w-5 h-5 text-amber-400" />
          DISCOUNT
        </button>

        <button
          type="button"
          className="h-14 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1"
        >
          <Ticket className="w-5 h-5 text-purple-400" />
          VOUCHER
        </button>

        <button
          type="button"
          onClick={handleClear}
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          className="h-14 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm rounded-xl border border-red-500/30 transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1"
        >
          <Eraser className="w-5 h-5" />
          CLEAR
        </button>
      </div>
    </div>
  );
};

export default MobileActionPanel;
