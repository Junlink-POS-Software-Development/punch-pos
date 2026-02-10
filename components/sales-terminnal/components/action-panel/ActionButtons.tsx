import React, { useRef } from "react";
import { Plus, Minus, CreditCard, Tag, Ticket, Archive, Eraser, Gift, ShoppingCart } from "lucide-react";

interface ActionButtonsProps {
  onAdd: () => void;
  onDiscount: () => void;
  onVoucher: () => void;
  onOpenDrawer: () => void;
  onCharge: () => void;
  onIncreaseQty: () => void;
  onDecreaseQty: () => void;
  onClearInput: () => void;
  onClearAll: () => void;
  // [NEW]
  isFreeMode?: boolean;
  onToggleFreeMode?: () => void;
}

export const ActionButtons = ({
  onAdd,
  onDiscount,
  onVoucher,
  onOpenDrawer,
  onCharge,
  onIncreaseQty,
  onDecreaseQty,
  onClearInput,
  onClearAll,
  isFreeMode,
  onToggleFreeMode,
}: ActionButtonsProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const handleMouseDown = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onClearAll();
    }, 800); // 800ms for long press
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!isLongPress.current) {
      onClearInput();
    }
  };

  const handleTouchStart = () => {
    handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent mouse events firing after touch
    handleMouseUp();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Primary Actions Grid - 3 cols on mobile, 5 on larger */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="col-span-1 bg-muted hover:bg-muted/80 border border-border text-muted-foreground font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <ShoppingCart className="w-4 h-4" />
          ADD
        </button>
        <button
          type="button"
          onClick={onDiscount}
          className="col-span-1 bg-muted hover:bg-muted/80 border border-border text-muted-foreground font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <Tag className="w-4 h-4" />
          DISC
        </button>
        <button
          type="button"
          onClick={onVoucher}
          className="col-span-1 bg-muted hover:bg-muted/80 border border-border text-muted-foreground font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <Ticket className="w-4 h-4" />
          VOUCH
        </button>
        <button
          type="button"
          onClick={onToggleFreeMode}
          className={`col-span-1 border font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1
             ${isFreeMode 
               ? "bg-purple-600 border-purple-500 text-white animate-pulse" 
               : "bg-muted hover:bg-muted/80 border-border text-muted-foreground"}
          `}
        >
          <Gift className={`w-4 h-4 ${isFreeMode ? "text-white" : ""}`} />
          FREE
        </button>
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => timerRef.current && clearTimeout(timerRef.current)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="col-span-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1 active:scale-95"
          title="Short press: Clear Input | Long press: Clear All"
        >
          <Eraser className="w-4 h-4" />
          CLEAR
        </button>
      </div>

      {/* Charge and Qty Control */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 h-12 sm:h-16">
        <button
          type="button"
          onClick={onDecreaseQty}
          className="col-span-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg transition-colors flex items-center justify-center"
        >
          <Minus className="w-6 h-6" />
        </button>
        
        <button
          type="button"
          onClick={onCharge}
          className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          CHARGE
        </button>

        <button
          type="button"
          onClick={onIncreaseQty}
          className="col-span-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-colors flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
