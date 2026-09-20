"use client";

import { CustomerSearchModal } from "../../modals/CustomerSearchModal";
import { useTerminalHeader } from "./hooks/useTerminalHeader";
import { CashierInfo } from "./components/CashierInfo";
import { CustomerSelector } from "./components/CustomerSelector";
import { HeaderToolbar } from "./components/HeaderToolbar";
import { TimeDisplay } from "./components/TimeDisplay";
import { ProductDisplay } from "./components/ProductDisplay";
import { FormFields } from "../FormFields";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import { useRestaurantStore } from "@/app/restaurant/stores/useRestaurantStore";
import { UtensilsCrossed } from "lucide-react";

type TerminalHeaderProps = {
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
};
export const TerminalHeader = ({
  setCustomerId,
  grandTotal,
  onAddToCartClick,
  onDoneSubmitTrigger,
  setActiveField,
  activeField,
  isTabletMode,
  onOpenThemeModal,
  onOpenTableModal,
}: TerminalHeaderProps) => {
  const { isRestaurant, modules } = useBusinessMode();
  const { tables, activeTableId } = useRestaurantStore();
  const activeTable = tables.find((t) => t.id === activeTableId);
  const {
    user,
    isSearchOpen,
    setIsSearchOpen,
    customerName,
    handleCustomerSelect,
    handleClearCustomer,
    currentProduct,
    isBackdating,
    customTransactionDate,
    setCustomTransactionDate,
    handleCustomerNameChange,
  } = useTerminalHeader(setCustomerId);

  const statusColor = isBackdating ? "text-amber-500" : "text-primary";
  const borderColor = isBackdating
    ? "border-amber-500/30"
    : "border-transparent";

  const isCustomerSelected =
    customerName && customerName !== "" && customerName !== "Walk-in Customer";

  return (
    <>
      <CustomerSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleCustomerSelect}
      />

      <div
        className={`relative z-20 flex flex-col mb-2 shrink-0 rounded-xl w-full text-foreground shadow-sm transition-all duration-300 border ${borderColor === "border-transparent" ? "border-border/50" : borderColor} bg-card/50`}
      >
        <div className="flex flex-row items-stretch w-full min-h-[240px]">
          {/* LEFT SECTION: Cashier, Customer, Tools */}
          <div className="flex flex-col justify-between p-6 w-[35%] border-r border-border bg-muted/20">
            <div className="space-y-4">
              <CashierInfo user={user} statusColor={statusColor} />

              {/* Restaurant Active Table Selector */}
              {(isRestaurant || modules.table_management) && (
                <button
                  type="button"
                  onClick={onOpenTableModal}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-card border border-primary/40 hover:border-primary hover:bg-primary/5 transition-all text-left shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block leading-tight">
                        Active Table
                      </span>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-black text-foreground truncate">
                          {activeTable
                            ? `${activeTable.tableNumber} • ${activeTable.tableName || activeTable.floorZone}`
                            : "Select Table"}
                        </span>
                        {activeTable?.status && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase shrink-0 ${
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
                  <span className="text-[10px] text-primary font-bold group-hover:underline shrink-0 ml-1">
                    Floor Plan
                  </span>
                </button>
              )}

              <CustomerSelector
                customerName={customerName || ""}
                isCustomerSelected={!!isCustomerSelected}
                onSearchOpen={() => setIsSearchOpen(true)}
                onClearCustomer={handleClearCustomer}
              />
            </div>
            
            <div className="mt-auto pt-4">
              <HeaderToolbar onOpenThemeModal={onOpenThemeModal} />
            </div>
          </div>

          {/* RIGHT SECTION: Total, Time, Product Status */}
          <div className="relative flex-1 p-6 bg-card">

            {/* Top Right: Time */}
            <div className="absolute top-6 right-6 z-20">
              <div className="bg-muted/50 px-4 py-2 rounded-lg border border-border backdrop-blur-sm shadow-sm">
                <TimeDisplay
                  isBackdating={isBackdating}
                  customTransactionDate={customTransactionDate}
                  setCustomTransactionDate={setCustomTransactionDate}
                />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 top-16 flex items-center justify-start pl-8 z-10 pointer-events-none">
              <div className="pointer-events-auto max-w-[60%]">
                <ProductDisplay
                  currentProduct={currentProduct}
                  isBackdating={isBackdating}
                />
              </div>
            </div>

            {/* Bottom Right: Grand Total */}
            <div className="absolute bottom-8 right-8 z-20">
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] mb-1">
                  Grand Total
                </span>
                <span className="pos-total-glow font-bold text-[2.5rem] text-primary tracking-tighter leading-none transition-all duration-300">
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
          />
        </div>
      </div>
    </>
  );
};

// export default removed (named export already exists)
