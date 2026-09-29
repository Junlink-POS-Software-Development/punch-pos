"use client";

import { useTerminalHeader } from "./hooks/useTerminalHeader";
import { CashierInfo } from "./components/CashierInfo";
import { HeaderToolbar } from "./components/HeaderToolbar";
import { TimeDisplay } from "./components/TimeDisplay";
import { ProductDisplay } from "./components/ProductDisplay";
import { FormFields } from "../FormFields";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import { useRestaurantStore } from "@/app/restaurant/stores/useRestaurantStore";
import { UtensilsCrossed, Scale } from "lucide-react";

type TerminalHeaderProps = {
  customerId?: string | null;
  setCustomerId: (id: string | null) => void;
  grandTotal: number;
  // Form Interaction Props
  onAddToCartClick: () => void;
  onDoneSubmitTrigger: () => void;
  setActiveField: (field: "customerName" | "barcode" | "quantity" | "freeSearch" | "freeQty" | null) => void;
  activeField: "customerName" | "barcode" | "quantity" | "freeSearch" | "freeQty" | null;
  isTabletMode?: boolean;
  onOpenThemeModal?: () => void;
  onOpenTableModal?: () => void;
  onOpenScaleModal?: () => void;
};
export const TerminalHeader = ({
  customerId,
  setCustomerId,
  grandTotal,
  onAddToCartClick,
  onDoneSubmitTrigger,
  setActiveField,
  activeField,
  isTabletMode,
  onOpenThemeModal,
  onOpenTableModal,
  onOpenScaleModal,
}: TerminalHeaderProps) => {
  const { isRestaurant, isGrocery, modules } = useBusinessMode();
  const { tables, activeTableId } = useRestaurantStore();
  const activeTable = tables.find((t) => t.id === activeTableId);
  const {
    user,
    currentProduct,
    isBackdating,
    customTransactionDate,
    setCustomTransactionDate,
  } = useTerminalHeader(setCustomerId);

  const statusColor = isBackdating ? "text-amber-500" : "text-primary";
  const borderColor = isBackdating
    ? "border-amber-500/30"
    : "border-transparent";

  return (
    <>

      <div
        className={`relative z-20 flex flex-col mb-1.5 shrink-0 rounded-xl w-full text-foreground shadow-sm transition-all duration-300 border ${borderColor === "border-transparent" ? "border-border/50" : borderColor} bg-card/50`}
      >
        <div className="flex flex-row items-stretch w-full min-h-[120px] sm:min-h-[135px] lg:min-h-[150px]">
          {/* LEFT SECTION: Cashier, Customer, Tools */}
          <div className="flex flex-col justify-between p-2.5 sm:p-3 lg:p-3.5 w-[38%] xl:w-[35%] border-r border-border bg-muted/20">
            <div className="space-y-1.5 sm:space-y-2">
              <CashierInfo user={user} statusColor={statusColor} />

              {/* Restaurant Active Table Selector */}
              {(isRestaurant || modules.table_management) && (
                <button
                  type="button"
                  onClick={onOpenTableModal}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-primary/40 hover:border-primary hover:bg-primary/5 transition-all text-left shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="p-1 rounded bg-primary/10 text-primary shrink-0">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block leading-tight">
                        Active Table
                      </span>
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-xs font-black text-foreground truncate">
                          {activeTable
                            ? `${activeTable.tableNumber} • ${activeTable.tableName || activeTable.floorZone}`
                            : "Select Table"}
                        </span>
                        {activeTable?.status && (
                          <span
                            className={`px-1 py-0.2 rounded text-[7px] font-bold uppercase shrink-0 ${
                              activeTable.status === "occupied"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : activeTable.status === "billing"
                                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                : activeTable.status === "reserved"
                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {activeTable.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-primary font-bold group-hover:underline shrink-0 ml-1">
                    Floor Plan
                  </span>
                </button>
              )}

              {/* Grocery Produce & Scale PLU Shortcut */}
              {(isGrocery || modules.weighed_items) && onOpenScaleModal && (
                <button
                  type="button"
                  onClick={onOpenScaleModal}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-card border border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/5 transition-all text-left shadow-xs cursor-pointer group"
                  title="Open Weighing Scale & Produce PLU Lookup [F4]"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="p-1 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block leading-tight">
                        Weighed Goods
                      </span>
                      <span className="text-xs font-black text-foreground truncate">
                        Produce Scale & PLU
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/20">
                    F4
                  </span>
                </button>
              )}
            </div>
            
            <div className="mt-auto pt-1.5 sm:pt-2">
              <HeaderToolbar onOpenThemeModal={onOpenThemeModal} />
            </div>
          </div>

          {/* RIGHT SECTION: Total, Time, Product Status */}
          <div className="relative flex-1 p-2.5 sm:p-3 lg:p-3.5 bg-card">

            {/* Top Right: Time */}
            <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20">
              <div className="bg-muted/50 px-2.5 py-1 rounded-md sm:rounded-lg border border-border backdrop-blur-sm shadow-xs">
                <TimeDisplay
                  isBackdating={isBackdating}
                  customTransactionDate={customTransactionDate}
                  setCustomTransactionDate={setCustomTransactionDate}
                />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-7 sm:top-8 flex items-center justify-start pl-3 sm:pl-4 z-10 pointer-events-none">
              <div className="pointer-events-auto max-w-[65%]">
                <ProductDisplay
                  currentProduct={currentProduct}
                  isBackdating={isBackdating}
                />
              </div>
            </div>

            {/* Bottom Right: Grand Total */}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20">
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-0.5">
                  Grand Total
                </span>
                <span className="pos-total-glow font-bold text-xl sm:text-2xl lg:text-3xl text-primary tracking-tighter leading-none transition-all duration-300">
                  ₱{grandTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* BOTTOM SECTION: Shared Input Fields */}
        <div className="w-full border-t border-border bg-muted/10">
          <FormFields
            onAddToCartClick={onAddToCartClick}
            onDoneSubmitTrigger={onDoneSubmitTrigger}
            setActiveField={setActiveField}
            activeField={activeField}
            isTabletMode={isTabletMode}
            customerId={customerId}
            setCustomerId={setCustomerId}
          />
        </div>
      </div>
    </>
  );
};

// export default removed (named export already exists)
