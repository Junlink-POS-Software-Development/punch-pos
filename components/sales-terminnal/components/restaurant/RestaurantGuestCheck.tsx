"use client";

import React, { useState, useMemo } from "react";
import {
  Receipt,
  ChefHat,
  CreditCard,
  Printer,
  Divide,
  Trash2,
  Plus,
  Minus,
  Clock,
  Users,
  ShieldCheck,
  Tag,
  AlertCircle,
  Percent,
} from "lucide-react";
import { CartItem } from "@/components/sales-terminnal/components/terminal-cart/types";
import { CourseType, RestaurantTable } from "@/lib/types/restaurant";
import { useRestaurantStore } from "@/app/restaurant/stores/useRestaurantStore";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";

interface RestaurantGuestCheckProps {
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onOpenModifier: (item: CartItem) => void;
  onSendKitchen: () => void;
  onPrintBill: () => void;
  onSplitCheck: () => void;
  onSettleBill: (totalWithServiceCharge?: number) => void;
  onDiscountClick: () => void;
  serviceChargeRate: number; // e.g. 0.10
  setServiceChargeRate: (rate: number) => void;
  guestCount: number;
}

const COURSE_HEADERS: Record<CourseType, { label: string; icon: string }> = {
  beverage: { label: "Beverages", icon: "🍹" },
  appetizer: { label: "Appetizers", icon: "🥗" },
  main: { label: "Main Courses", icon: "🥩" },
  dessert: { label: "Desserts", icon: "🍰" },
  side: { label: "Side Dishes", icon: "🍟" },
};

export const RestaurantGuestCheck: React.FC<RestaurantGuestCheckProps> = ({
  cartItems,
  onRemoveItem,
  onUpdateItem,
  onOpenModifier,
  onSendKitchen,
  onPrintBill,
  onSplitCheck,
  onSettleBill,
  onDiscountClick,
  serviceChargeRate,
  setServiceChargeRate,
  guestCount,
}) => {
  const { tables, activeTableId } = useRestaurantStore();
  const { modules, isPharmacy } = useBusinessMode();
  const activeTable = tables.find((t) => t.id === activeTableId);

  // Group items by course
  const groupedItems = useMemo(() => {
    const groups: Record<CourseType, CartItem[]> = {
      beverage: [],
      appetizer: [],
      main: [],
      dessert: [],
      side: [],
    };

    cartItems.forEach((item) => {
      const course = item.course || "main";
      if (!groups[course]) groups[course] = [];
      groups[course].push(item);
    });

    return groups;
  }, [cartItems]);

  const itemsSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [cartItems]);

  const serviceChargeAmount = useMemo(() => {
    return Math.round(itemsSubtotal * serviceChargeRate * 100) / 100;
  }, [itemsSubtotal, serviceChargeRate]);

  const grandTotal = itemsSubtotal + serviceChargeAmount;

  const unsentCount = useMemo(() => {
    return cartItems.filter(
      (i) => !i.kitchenStatus || i.kitchenStatus === "pending" || i.kitchenStatus === "unsent"
    ).length;
  }, [cartItems]);

  const formatElapsed = (isoTime?: string) => {
    if (!isoTime) return "";
    const start = new Date(isoTime).getTime();
    const diffMin = Math.max(0, Math.floor((Date.now() - start) / 60000));
    if (diffMin < 60) return `${diffMin}m`;
    const hours = Math.floor(diffMin / 60);
    const mins = diffMin % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <aside className="flex flex-col h-full w-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Check Header */}
      <div className="p-4 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <h3 className="font-black text-sm text-foreground tracking-tight">
              {activeTable
                ? `${activeTable.tableNumber} • Guest Check`
                : "Dining Guest Check"}
            </h3>
          </div>

          {activeTable?.status && (
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                activeTable.status === "occupied"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  : activeTable.status === "billing"
                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {activeTable.status}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {guestCount} Guests • {activeTable?.currentSession?.serverName || "Server"}
          </span>

          {activeTable?.currentSession?.startedAt && (
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              Elapsed: {formatElapsed(activeTable.currentSession.startedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Course Grouped Items Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
            <div className="p-3 rounded-2xl bg-muted/40 text-muted-foreground">
              <Receipt className="w-8 h-8 opacity-40" />
            </div>
            <span className="text-xs font-bold text-foreground">
              Guest check is empty
            </span>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Tap items from the menu catalog to begin taking the table order.
            </p>
          </div>
        ) : (
          (Object.keys(COURSE_HEADERS) as CourseType[]).map((courseKey) => {
            const courseItems = groupedItems[courseKey];
            if (!courseItems || courseItems.length === 0) return null;

            const { label, icon } = COURSE_HEADERS[courseKey];

            return (
              <div key={courseKey} className="space-y-2">
                {/* Course Header Bar */}
                <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-muted/40 border border-border/50 text-xs">
                  <span className="font-black text-foreground flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {courseItems.length} {courseItems.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Line Items in this course */}
                <div className="space-y-1.5">
                  {courseItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all space-y-1"
                    >
                      {/* Top: Quantity, Title, Price */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          {/* Qty Controls */}
                          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-0.5 border border-border/50 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateItem(item.id, {
                                    quantity: item.quantity - 1,
                                    total: (item.quantity - 1) * item.unitPrice,
                                  });
                                } else {
                                  onRemoveItem(item.id);
                                }
                              }}
                              className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>

                            <span className="font-mono font-bold text-xs px-1 text-foreground">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                onUpdateItem(item.id, {
                                  quantity: item.quantity + 1,
                                  total: (item.quantity + 1) * item.unitPrice,
                                });
                              }}
                              className="w-4 h-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          {/* Item Name */}
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-xs text-foreground block truncate">
                              {item.itemName}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ₱{item.unitPrice.toFixed(2)} each
                            </span>
                          </div>
                        </div>

                        {/* Price & Delete */}
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-foreground">
                            ₱{item.total.toFixed(2)}
                          </span>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Modifiers List */}
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-12 pt-0.5">
                          {item.modifiers.map((mod, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            >
                              {mod.optionName}
                              {mod.priceAdjustment > 0
                                ? ` (+₱${mod.priceAdjustment.toFixed(2)})`
                                : ""}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Prep Notes */}
                      {item.notes && (
                        <div className="pl-12 text-[10px] text-red-600 dark:text-red-400 italic">
                          Note: {item.notes}
                        </div>
                      )}

                      {/* Bottom Row: Kitchen Status & Customize Button */}
                      <div className="flex items-center justify-between pl-12 pt-1 border-t border-border/30 text-[10px]">
                        <div>
                          {item.kitchenStatus === "sent" ? (
                            <span className="px-1.5 py-0.2 rounded font-bold uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400">
                              ✓ Sent to Kitchen
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              ⏳ New / Unsent
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenModifier(item)}
                          className="flex items-center gap-1 text-primary hover:underline font-bold cursor-pointer"
                        >
                          <ChefHat className="w-3 h-3" />
                          <span>Customize</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Totals & Service Charge */}
      <div className="p-4 border-t border-border bg-muted/20 space-y-2.5 shrink-0">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Items Subtotal</span>
          <span className="font-mono font-bold text-foreground">
            ₱{itemsSubtotal.toFixed(2)}
          </span>
        </div>

        {/* 10% Service Charge Toggle */}
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setServiceChargeRate(serviceChargeRate > 0 ? 0 : 0.1)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                serviceChargeRate > 0
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {serviceChargeRate > 0 && <span className="text-[10px]">✓</span>}
            </div>
            <span>Service Charge (10%)</span>
          </button>

          <span className="font-mono font-bold text-foreground">
            +₱{serviceChargeAmount.toFixed(2)}
          </span>
        </div>

        {/* Discounts & Statutory */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onDiscountClick}
              disabled={cartItems.length === 0}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-card text-[10px] font-bold text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
            >
              <Tag className="w-3 h-3" />
              Discount
            </button>

            {(modules.statutory_sc_pwd || isPharmacy) && (
              <button
                type="button"
                onClick={onDiscountClick}
                disabled={cartItems.length === 0}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-bold text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-40 cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3" />
                SC/PWD (20%)
              </button>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Total Due
            </span>
            <span className="text-xl font-black text-primary font-mono tracking-tight">
              ₱{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Send Kitchen KOT */}
          <button
            type="button"
            onClick={onSendKitchen}
            disabled={cartItems.length === 0}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer ${
              unsentCount > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs animate-pulse"
                : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/30"
            }`}
            title="Fire open order to Kitchen / Bar"
          >
            <ChefHat className="w-4 h-4" />
            <span>Send KOT {unsentCount > 0 ? `(${unsentCount})` : ""}</span>
          </button>

          {/* Print Guest Bill */}
          <button
            type="button"
            onClick={onPrintBill}
            disabled={cartItems.length === 0}
            className="py-2 px-3 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            title="Print pre-payment check for table"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bill</span>
          </button>

          {/* Split Bill */}
          <button
            type="button"
            onClick={onSplitCheck}
            disabled={cartItems.length === 0}
            className="py-2 px-3 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
            title="Split check equally or by seat"
          >
            <Divide className="w-4 h-4" />
            <span>Split Check</span>
          </button>

          {/* Settle / Pay Bill */}
          <button
            type="button"
            onClick={() => onSettleBill(grandTotal)}
            disabled={cartItems.length === 0}
            className="py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            title="Pay / Settle Table Bill (F2)"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Bill</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
