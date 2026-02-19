// Mobile Cart Panel - Collapsible right side showing cart items
"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { CartItem } from "../terminal-cart/types";

interface MobileCartPanelProps {
  cartItems: CartItem[];
  grandTotal: number;
  onRemoveItem: (sku: string) => void;
  onCharge: () => void;
}

export const MobileCartPanel = ({
  cartItems,
  grandTotal,
  onRemoveItem,
  onCharge,
}: MobileCartPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Toggle Button - Fixed on right edge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-800 border border-r-0 border-slate-700 rounded-l-lg p-2 text-white shadow-lg"
      >
        {isExpanded ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        {cartItems.length > 0 && !isExpanded && (
          <span className="absolute -top-2 -left-2 bg-emerald-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      <div
        className={`
          lg:hidden fixed top-0 right-0 h-full w-[280px] z-30 
          bg-[#0F172A] border-l border-slate-800 
          transition-transform duration-300 ease-in-out
          ${isExpanded ? "translate-x-0" : "translate-x-full"}
          flex flex-col
        `}
      >
        {/* Grand Total Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs uppercase tracking-widest">
              Grand Total
            </span>
            <span className="font-bold text-2xl text-emerald-400">
              ₱{grandTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="text-slate-500 text-xs mt-1">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-2">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <span className="text-sm">Cart is empty</span>
            </div>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {item.itemName}
                      </p>
                      <p className="text-slate-400 text-xs">
                        ₱{(item.unitPrice ?? 0).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.sku)}
                      className="p-1 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-emerald-400 font-bold text-sm">
                      ₱{(item.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Charge Button Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={onCharge}
            disabled={cartItems.length === 0}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold text-lg rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            CHARGE
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default MobileCartPanel;
