"use client";

import { CustomerSearchModal } from "../../modals/CustomerSearchModal";
import { useTerminalHeader } from "./hooks/useTerminalHeader";
import { CashierInfo } from "./components/CashierInfo";
import { CustomerSelector } from "./components/CustomerSelector";
import { HeaderToolbar } from "./components/HeaderToolbar";
import { TimeDisplay } from "./components/TimeDisplay";
import { ProductDisplay } from "./components/ProductDisplay";
import { MobileHeader } from "../mobile-view/MobileHeader";

type TerminalHeaderProps = {

  setCustomerId: (id: string | null) => void;
  grandTotal: number;
};

export const TerminalHeader = ({

  setCustomerId,
  grandTotal,
}: TerminalHeaderProps) => {
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

  const statusColor = isBackdating ? "text-amber-400" : "text-cyan-400";
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
        className={`flex flex-col sm:flex-row items-stretch mb-2 sm:mb-4 rounded-xl w-full min-h-[180px] sm:min-h-[260px] text-foreground shadow-sm transition-all duration-300 border ${borderColor === "border-transparent" ? "border-border" : borderColor} overflow-hidden bg-card/50`}
      >
        {/* LEFT SECTION: Cashier, Customer, Tools - Hidden on mobile except Customer */}
        <div className="hidden sm:flex flex-col justify-between p-5 w-[35%] border-r border-border bg-muted/20">
          <div className="space-y-4">
             <CashierInfo user={user} statusColor={statusColor} />
             <CustomerSelector
                customerName={customerName || ""}
                isCustomerSelected={!!isCustomerSelected}
                onSearchOpen={() => setIsSearchOpen(true)}
                onClearCustomer={handleClearCustomer}
              />
          </div>
          
          <div className="mt-auto pt-4">
             <HeaderToolbar />
          </div>
        </div>

        {/* RIGHT SECTION: Total, Time, Product Status */}
        <div className="relative flex-1 p-3 sm:p-6 min-h-[120px] sm:min-h-0 bg-card">

          {/* Mobile layout: flex column */}
          <MobileHeader
            customerName={customerName || ""}
            isCustomerSelected={!!isCustomerSelected}
            onSearchOpen={() => setIsSearchOpen(true)}
            onClearCustomer={handleClearCustomer}
            onCustomerNameChange={handleCustomerNameChange}
            currentProduct={currentProduct}
            grandTotal={grandTotal}
            isBackdating={isBackdating}
          />

          {/* Desktop layout: absolute positioning */}
          <div className="hidden sm:block">
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

            {/* Center Left: Product Display */}
            <div className="absolute inset-0 flex items-center justify-start pl-6 z-10 pointer-events-none">
              <div className="pointer-events-auto">
                <ProductDisplay
                  currentProduct={currentProduct}
                  isBackdating={isBackdating}
                />
              </div>
            </div>

            {/* Bottom Right: Grand Total */}
            <div className="absolute bottom-6 right-6 z-20">
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
                  Grand Total
                </span>
                <span className="font-bold text-5xl text-primary tracking-tighter">
                  ₱{grandTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TerminalHeader;
