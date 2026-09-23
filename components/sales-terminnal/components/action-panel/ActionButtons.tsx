import React, { useRef } from "react";
import { Plus, Minus, CreditCard, Tag, Ticket, Archive, Eraser, Gift, ShoppingCart, ShieldCheck, ChefHat, UtensilsCrossed, Divide, Scale } from "lucide-react";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";

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
  // Restaurant actions
  onSendKitchen?: () => void;
  onSplitCheck?: () => void;
  onOpenTableModal?: () => void;
  // Grocery actions
  onOpenScaleModal?: () => void;
  // Compact mode for squeezing into tablet keyboard
  compact?: boolean;
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
  onSendKitchen,
  onSplitCheck,
  onOpenTableModal,
  onOpenScaleModal,
  compact = false,
}: ActionButtonsProps) => {
  const { modules, isPharmacy, isRestaurant, isGrocery } = useBusinessMode();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const handleMouseDown = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault(); // [NEW] Prevent focus loss
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

  if (compact) {
    return (
      <div className="flex flex-col gap-1.5 w-full select-none">
        {/* Row 1: Quick Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 w-full">
          <button
            type="button"
            onClick={onAdd}
            onMouseDown={(e) => e.preventDefault()}
            className="flex-1 min-w-0 h-8 sm:h-8.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-xs"
            title="Add Item (Enter)"
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">ADD</span>
          </button>

          <button
            type="button"
            onClick={onDiscount}
            onMouseDown={(e) => e.preventDefault()}
            className="flex-1 min-w-0 h-8 sm:h-8.5 bg-muted hover:bg-muted/80 border border-border text-foreground font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-xs"
            title="Order / Item Discount"
          >
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">DISC</span>
          </button>

          {(modules.statutory_sc_pwd || isPharmacy) && (
            <button
              type="button"
              onClick={onDiscount}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 min-w-0 h-8 sm:h-8.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              title="Senior Citizen & PWD Statutory 20% Discount"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">SC/PWD</span>
            </button>
          )}

          {(modules.table_management || isRestaurant) && onOpenTableModal && (
            <button
              type="button"
              onClick={onOpenTableModal}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 min-w-0 h-8 sm:h-8.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              title="Floor Plan & Tables"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">TABLE</span>
            </button>
          )}

          {(modules.kitchen_display || isRestaurant) && onSendKitchen && (
            <button
              type="button"
              onClick={onSendKitchen}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 min-w-0 h-8 sm:h-8.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              title="Send Order to Kitchen (KOT)"
            >
              <ChefHat className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">KITCHEN</span>
            </button>
          )}

          {(modules.split_check || isRestaurant) && onSplitCheck && (
            <button
              type="button"
              onClick={onSplitCheck}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 min-w-0 h-8 sm:h-8.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              title="Split Bill"
            >
              <Divide className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">SPLIT</span>
            </button>
          )}

          {(modules.weighed_items || isGrocery) && onOpenScaleModal && (
            <button
              type="button"
              onClick={onOpenScaleModal}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-1 min-w-0 h-8 sm:h-8.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              title="Weighing Scale & Produce PLU Lookup [F4]"
            >
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">SCALE</span>
            </button>
          )}

          <button
            type="button"
            onClick={onVoucher}
            onMouseDown={(e) => e.preventDefault()}
            className="flex-1 min-w-0 h-8 sm:h-8.5 bg-muted hover:bg-muted/80 border border-border text-foreground font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-xs"
            title="Redeem Voucher"
          >
            <Ticket className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">VOUCH</span>
          </button>

          <button
            type="button"
            onClick={onToggleFreeMode}
            onMouseDown={(e) => e.preventDefault()}
            className={`flex-1 min-w-0 h-8 sm:h-8.5 border font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-xs
              ${isFreeMode 
                ? "bg-purple-600 border-purple-500 text-white animate-pulse" 
                : "bg-muted hover:bg-muted/80 border-border text-foreground"}
            `}
            title="Free Item"
          >
            <Gift className={`w-3.5 h-3.5 shrink-0 ${isFreeMode ? "text-white" : ""}`} />
            <span className="truncate">FREE</span>
          </button>

          <button
            type="button"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => timerRef.current && clearTimeout(timerRef.current)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex-1 min-w-0 h-8 sm:h-8.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-bold rounded-lg transition-colors text-[10px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-xs"
            title="Short press: Clear Input | Long press: Clear All"
          >
            <Eraser className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">CLEAR</span>
          </button>
        </div>

        {/* Row 2: Qty Adjustment & Charge Button */}
        <div className="flex items-center gap-1.5 h-9 sm:h-10 w-full">
          <button
            type="button"
            onClick={onDecreaseQty}
            onMouseDown={(e) => e.preventDefault()}
            className="w-12 sm:w-14 h-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg transition-colors flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
            title="Decrease Quantity"
          >
            <Minus className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={onCharge}
            onMouseDown={(e) => e.preventDefault()}
            className="flex-1 h-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm sm:text-base rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            title="Process Payment (F2)"
          >
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>CHARGE</span>
          </button>

          <button
            type="button"
            onClick={onIncreaseQty}
            onMouseDown={(e) => e.preventDefault()}
            className="w-12 sm:w-14 h-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-colors flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
            title="Increase Quantity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Primary Actions Grid - 3 cols on mobile, 5 on larger */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onAdd}
          onMouseDown={(e) => e.preventDefault()}
          className="col-span-1 bg-muted hover:bg-muted/80 border border-border text-muted-foreground font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <ShoppingCart className="w-4 h-4" />
          ADD
        </button>
        <button
          type="button"
          onClick={onDiscount}
          onMouseDown={(e) => e.preventDefault()}
          className="col-span-1 bg-muted hover:bg-muted/80 border border-border text-muted-foreground font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <Tag className="w-4 h-4" />
          DISC
        </button>
        {(modules.statutory_sc_pwd || isPharmacy) && (
          <button
            type="button"
            onClick={onDiscount}
            onMouseDown={(e) => e.preventDefault()}
            className="col-span-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
            title="Senior Citizen & PWD Statutory 20% Discount"
          >
            <ShieldCheck className="w-4 h-4" />
            SC/PWD
          </button>
        )}
        {(modules.table_management || isRestaurant) && onOpenTableModal && (
          <button
            type="button"
            onClick={onOpenTableModal}
            onMouseDown={(e) => e.preventDefault()}
            className="col-span-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
            title="Floor Plan & Tables"
          >
            <UtensilsCrossed className="w-4 h-4" />
            TABLE
          </button>
        )}
        {(modules.kitchen_display || isRestaurant) && onSendKitchen && (
          <button
            type="button"
            onClick={onSendKitchen}
            onMouseDown={(e) => e.preventDefault()}
            className="col-span-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
            title="Send Order to Kitchen (KOT)"
          >
            <ChefHat className="w-4 h-4" />
            KITCHEN
          </button>
        )}
        {(modules.split_check || isRestaurant) && onSplitCheck && (
          <button
            type="button"
            onClick={onSplitCheck}
            onMouseDown={(e) => e.preventDefault()}
            className="col-span-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
            title="Split Bill"
          >
            <Divide className="w-4 h-4" />
            SPLIT
          </button>
        )}
        {(modules.weighed_items || isGrocery) && onOpenScaleModal && (
          <button
            type="button"
            onClick={onOpenScaleModal}
            onMouseDown={(e) => e.preventDefault()}
            className="col-span-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1 cursor-pointer"
            title="Weighing Scale & Produce PLU Lookup [F4]"
          >
            <Scale className="w-4 h-4" />
            SCALE/PLU
          </button>
        )}
        <button
          type="button"
          onClick={onVoucher}
          onMouseDown={(e) => e.preventDefault()}
          className="col-span-1 bg-muted hover:bg-muted/80 border border-border text-muted-foreground font-bold py-2 sm:py-3 rounded-lg transition-colors text-xs flex flex-col items-center justify-center gap-1"
        >
          <Ticket className="w-4 h-4" />
          VOUCH
        </button>
        <button
          type="button"
          onClick={onToggleFreeMode}
          onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
          className="col-span-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-lg transition-colors flex items-center justify-center"
        >
          <Minus className="w-6 h-6" />
        </button>
        
        <button
          type="button"
          onClick={onCharge}
          onMouseDown={(e) => e.preventDefault()}
          className="col-span-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          CHARGE
        </button>

        <button
          type="button"
          onClick={onIncreaseQty}
          onMouseDown={(e) => e.preventDefault()}
          className="col-span-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-colors flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
