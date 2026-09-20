"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Divide,
  Users,
  CheckSquare,
  ArrowRightLeft,
  Receipt,
  CreditCard,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { CartItem } from "@/components/sales-terminnal/components/terminal-cart/types";

interface SplitCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  grandTotal: number;
  onTenderSplitShare?: (amount: number, label: string) => void;
}

interface ItemCheckGroup {
  id: string;
  name: string;
  items: CartItem[];
}

export const SplitCheckModal: React.FC<SplitCheckModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  grandTotal,
  onTenderSplitShare,
}) => {
  const [activeTab, setActiveTab] = useState<"equal" | "items">("equal");
  const [splitCount, setSplitCount] = useState<number>(2);

  // Split by Items state
  const [checks, setChecks] = useState<ItemCheckGroup[]>([
    { id: "check-1", name: "Check 1", items: [...cartItems] },
    { id: "check-2", name: "Check 2", items: [] },
  ]);

  const amountPerPerson = useMemo(() => {
    if (splitCount <= 0) return grandTotal;
    return grandTotal / splitCount;
  }, [grandTotal, splitCount]);

  if (!isOpen) return null;

  const handleAddCheck = () => {
    const nextNum = checks.length + 1;
    setChecks([
      ...checks,
      { id: `check-${Date.now()}`, name: `Check ${nextNum}`, items: [] },
    ]);
  };

  const handleMoveItem = (
    fromCheckId: string,
    toCheckId: string,
    itemId: string
  ) => {
    const fromCheck = checks.find((c) => c.id === fromCheckId);
    if (!fromCheck) return;
    const itemIndex = fromCheck.items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;

    const itemToMove = fromCheck.items[itemIndex];
    const newFromItems = fromCheck.items.filter((_, idx) => idx !== itemIndex);

    setChecks(
      checks.map((c) => {
        if (c.id === fromCheckId) {
          return { ...c, items: newFromItems };
        }
        if (c.id === toCheckId) {
          return { ...c, items: [...c.items, itemToMove] };
        }
        return c;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-3xl max-h-[90vh] bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Divide className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Split Bill & Check Separation
              </h2>
              <p className="text-xs text-muted-foreground">
                Divide bill equally among diners or organize items into separate checks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-3 border-b border-border bg-card/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-xl border border-border/50 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("equal")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "equal"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1.5" />
              Split Equally (By Headcount)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("items")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "items"
                  ? "bg-background text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 inline mr-1.5" />
              Split by Items (Separate Checks)
            </button>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
              Table Grand Total
            </span>
            <span className="text-sm font-black text-foreground">
              ₱{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Tab 1: Split Equally */}
        {activeTab === "equal" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Number of Diners Control */}
            <div className="p-4 rounded-2xl bg-muted/20 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  How many ways to split?
                </span>
                <span className="text-xs text-muted-foreground">
                  Choose headcount for equal division.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {[2, 3, 4, 5, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSplitCount(count)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      splitCount === count
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground hover:text-foreground border-border"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Shares Breakdown Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Individual Guest Shares ({splitCount} Diners)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: splitCount }).map((_, idx) => {
                  const shareNumber = idx + 1;
                  return (
                    <div
                      key={shareNumber}
                      className="p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          Guest #{shareNumber}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground">
                          Share 1/{splitCount}
                        </span>
                      </div>

                      <div className="py-2">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                          Amount Due
                        </span>
                        <span className="text-xl font-black text-primary font-mono">
                          ₱{amountPerPerson.toFixed(2)}
                        </span>
                      </div>

                      {onTenderSplitShare && (
                        <button
                          type="button"
                          onClick={() => {
                            onTenderSplitShare(
                              amountPerPerson,
                              `Guest #${shareNumber}`
                            );
                            onClose();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Tender Share
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Split by Items */}
        {activeTab === "items" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Drag or move items into distinct guest checks.
              </span>
              <button
                type="button"
                onClick={handleAddCheck}
                className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Check
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checks.map((check, checkIdx) => {
                const checkTotal = check.items.reduce(
                  (sum, item) => sum + item.total,
                  0
                );
                const otherChecks = checks.filter((c) => c.id !== check.id);

                return (
                  <div
                    key={check.id}
                    className="p-4 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="font-bold text-sm text-foreground">
                        {check.name} ({check.items.length} items)
                      </span>
                      <span className="font-black text-sm text-primary font-mono">
                        ₱{checkTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Check Items List */}
                    <div className="space-y-1.5 min-h-[120px] max-h-[220px] overflow-y-auto pr-1">
                      {check.items.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
                          Empty Check. Move items here from other checks.
                        </div>
                      ) : (
                        check.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-foreground truncate block">
                                {item.quantity}x {item.itemName}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ₱{item.total.toFixed(2)}
                              </span>
                            </div>

                            {/* Move item button */}
                            {otherChecks.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveItem(
                                    check.id,
                                    otherChecks[0].id,
                                    item.id
                                  )
                                }
                                className="p-1 rounded text-[10px] text-primary hover:bg-primary/10 transition-colors"
                                title={`Move to ${otherChecks[0].name}`}
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Tender Check */}
                    {onTenderSplitShare && (
                      <button
                        type="button"
                        disabled={check.items.length === 0}
                        onClick={() => {
                          onTenderSplitShare(checkTotal, check.name);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Tender {check.name} (₱{checkTotal.toFixed(2)})
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Receipt className="w-3.5 h-3.5 text-primary" />
            <span>Guest checks can be tendered individually or printed separately.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
