"use client";

import React, { useState, useEffect } from "react";
import { X, Tag, Percent, DollarSign, ShieldCheck } from "lucide-react";
import { CartItem, DiscountType } from "../components/terminal-cart/types";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'item' | 'transaction';
  // Per-item mode
  targetItem?: CartItem | null;
  onApplyItemDiscount?: (itemId: string, discountType: DiscountType, discountValue: number) => void;
  // Per-transaction mode
  subtotal?: number;
  onApplyTransactionDiscount?: (discountType: DiscountType, discountValue: number) => void;
  // Layout
  isTabletMode?: boolean;
  // Current values (for editing existing discounts)
  currentDiscountType?: DiscountType | null;
  currentDiscountValue?: number | null;
}

export const DiscountModal = ({
  isOpen,
  onClose,
  mode,
  targetItem,
  onApplyItemDiscount,
  subtotal = 0,
  onApplyTransactionDiscount,
  isTabletMode,
  currentDiscountType,
  currentDiscountValue,
}: DiscountModalProps) => {
  const { modules, isPharmacy } = useBusinessMode();
  const [discountType, setDiscountType] = useState<DiscountType>('flat');
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Initialize with current values when opening
  useEffect(() => {
    if (isOpen) {
      setDiscountType(currentDiscountType || 'flat');
      setInputValue(currentDiscountValue ? String(currentDiscountValue) : "");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentDiscountType, currentDiscountValue]);

  // Handle Virtual Keyboard Events (for tablet mode)
  useEffect(() => {
    if (!isOpen) return;

    const handleVirtualKey = (e: CustomEvent<{ key: string }>) => {
      e.preventDefault();
      const { key } = e.detail;

      if (key === "Enter") {
        handleApply();
        return;
      }

      if (key === "Backspace") {
        setInputValue(prev => prev.slice(0, -1));
      } else if (!isNaN(Number(key)) || key === ".") {
        setInputValue(prev => prev + key);
      }
    };

    const handleVirtualClear = (e: CustomEvent) => {
      e.preventDefault();
      setInputValue("");
    };

    window.addEventListener("virtual-keypress", handleVirtualKey as EventListener);
    window.addEventListener("virtual-keyclear", handleVirtualClear as EventListener);
    return () => {
      window.removeEventListener("virtual-keypress", handleVirtualKey as EventListener);
      window.removeEventListener("virtual-keyclear", handleVirtualClear as EventListener);
    };
  }, [isOpen, inputValue, discountType, mode, targetItem, subtotal]);

  // Compute preview
  const numericValue = parseFloat(inputValue) || 0;
  const baseAmount = mode === 'item' && targetItem
    ? targetItem.unitPrice * targetItem.quantity
    : subtotal;

  let computedDiscount = 0;
  if (discountType === 'percent') {
    computedDiscount = Math.round(baseAmount * (numericValue / 100) * 100) / 100;
  } else {
    computedDiscount = numericValue;
  }
  computedDiscount = Math.min(computedDiscount, baseAmount);
  const newTotal = Math.max(baseAmount - computedDiscount, 0);

  // Validation
  const isValid = numericValue > 0 && computedDiscount <= baseAmount && (
    discountType !== 'percent' || numericValue <= 100
  );

  const handleApply = () => {
    if (!isValid) {
      if (numericValue <= 0) {
        setError("Please enter a discount value.");
      } else if (discountType === 'percent' && numericValue > 100) {
        setError("Percentage cannot exceed 100%.");
      } else {
        setError("Discount exceeds the total amount.");
      }
      return;
    }

    if (mode === 'item' && targetItem && onApplyItemDiscount) {
      onApplyItemDiscount(targetItem.id, discountType, numericValue);
    } else if (mode === 'transaction' && onApplyTransactionDiscount) {
      onApplyTransactionDiscount(discountType, numericValue);
    }
    onClose();
  };

  const handleRemoveDiscount = () => {
    if (mode === 'item' && targetItem && onApplyItemDiscount) {
      onApplyItemDiscount(targetItem.id, 'flat', 0);
    } else if (mode === 'transaction' && onApplyTransactionDiscount) {
      onApplyTransactionDiscount('flat', 0);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  const title = mode === 'item'
    ? `Discount: ${targetItem?.itemName || 'Item'}`
    : 'Order Discount';

  const hasExistingDiscount = (currentDiscountValue || 0) > 0;

  const content = (
    <div className={`bg-card w-full flex flex-col transition-all ${isTabletMode ? 'h-full shadow-sm rounded-2xl border border-border' : 'max-w-md rounded-2xl shadow-xl border border-border'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-border bg-muted/20 shrink-0 ${isTabletMode ? 'p-6' : 'p-4'}`}>
        <h2 className={`${isTabletMode ? 'text-2xl' : 'text-xl'} font-bold text-foreground flex items-center gap-2`}>
          <Tag className="w-5 h-5 text-primary" />
          {title}
        </h2>
        <button
          onClick={onClose}
          className={isTabletMode ? 'p-2 bg-muted rounded-full hover:bg-muted/80 text-muted-foreground transition-all' : 'text-muted-foreground hover:text-foreground transition-colors'}
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Base Amount Display */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">
            {mode === 'item' ? 'Line Subtotal' : 'Order Subtotal'}
          </p>
          <p className="font-bold text-3xl text-foreground">
            ₱{baseAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Statutory Senior / PWD Banner (Prominently visible when active) */}
        {(modules.statutory_sc_pwd || isPharmacy) && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-emerald-600">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs font-bold leading-tight text-foreground">
                  Senior Citizen & PWD Statutory Discount
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Official 20% statutory deduction on medicines & items
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setDiscountType('percent');
                setInputValue("20");
                setError(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                discountType === 'percent' && inputValue === '20'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/40'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              Apply 20%
            </button>
          </div>
        )}

        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setDiscountType('flat');
              setInputValue("");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              discountType === 'flat'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Flat Amount (₱)
          </button>
          <button
            type="button"
            onClick={() => {
              setDiscountType('percent');
              setInputValue("");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              discountType === 'percent'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Percent className="w-4 h-4" />
            Percentage (%)
          </button>
        </div>

        {/* Input */}
        <div>
          <label className="block mb-1 text-muted-foreground text-sm">
            {discountType === 'flat' ? 'Discount Amount (₱)' : 'Discount Percentage (%)'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">
              {discountType === 'flat' ? '₱' : '%'}
            </span>
            <input
              ref={inputRef}
              type="number"
              min="0"
              max={discountType === 'percent' ? 100 : baseAmount}
              step="0.01"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-muted/20 border border-input text-foreground pl-10 pr-4 py-4 rounded-xl focus:outline-none focus:border-primary transition-colors focus:ring-2 focus:ring-primary/30 font-bold text-2xl text-right"
              placeholder="0.00"
              inputMode={isTabletMode ? "none" : "decimal"}
            />
          </div>

          {/* Quick Preset Buttons (Always Visible) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-xs text-muted-foreground mr-1">Quick Presets:</span>
            {discountType === 'percent' ? (
              <>
                {[5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setInputValue(pct.toString());
                      setError(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      inputValue === pct.toString()
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/30 hover:bg-muted border-border text-foreground"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}

                {(modules.statutory_sc_pwd || isPharmacy) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('percent');
                      setInputValue("20");
                      setError(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      inputValue === "20" && discountType === 'percent'
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Senior / PWD (20%)</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {[10, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setInputValue(amt.toString());
                      setError(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      inputValue === amt.toString()
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted/30 hover:bg-muted border-border text-foreground"
                    }`}
                  >
                    ₱{amt}
                  </button>
                ))}

                {(modules.statutory_sc_pwd || isPharmacy) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('percent');
                      setInputValue("20");
                      setError(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Senior / PWD (20%)</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Live Preview */}
        {numericValue > 0 && (
          <div className="bg-muted/20 p-4 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Discount Amount</span>
              <span className="font-bold text-red-500">
                -₱{computedDiscount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-2">
              <span className="font-medium text-muted-foreground">
                {mode === 'item' ? 'New Line Total' : 'New Grand Total'}
              </span>
              <span className="font-bold text-xl text-primary">
                ₱{newTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-destructive text-sm text-center font-medium animate-in fade-in">{error}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 p-4 border-t border-border bg-muted/10 shrink-0">
        {hasExistingDiscount && (
          <button
            onClick={handleRemoveDiscount}
            className="px-4 py-3 rounded-xl font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm"
          >
            Remove
          </button>
        )} 
        <button
          onClick={onClose}
          className="flex-1 bg-muted hover:bg-muted/80 py-3 rounded-xl font-medium text-muted-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={!isValid}
          className={`flex-1 py-3 rounded-xl font-bold text-primary-foreground transition-all ${
            isValid
              ? "bg-primary hover:bg-primary/90 shadow-md"
              : "bg-muted cursor-not-allowed opacity-50"
          }`}
        >
          Apply Discount
        </button>
      </div>
    </div>
  );

  return isTabletMode ? content : (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {content}
    </div>
  );
};
