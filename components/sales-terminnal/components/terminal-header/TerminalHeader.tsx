"use client";

import { CustomerSearchModal } from "../../modals/CustomerSearchModal";
import { useTerminalHeader } from "./hooks/useTerminalHeader";
import { CashierInfo } from "./components/CashierInfo";
import { CustomerSelector } from "./components/CustomerSelector";
import { HeaderToolbar } from "./components/HeaderToolbar";
import { TimeDisplay } from "./components/TimeDisplay";
import { ProductDisplay } from "./components/ProductDisplay";
import { MobileHeader } from "../mobile-view/MobileHeader";
import FormFields from "../FormFields";
import MobileFormFields from "../mobile-view/MobileFormFields";

type TerminalHeaderProps = {
  setCustomerId: (id: string | null) => void;
  grandTotal: number;
  // Form Interaction Props
  onAddToCartClick: () => void;
  onDoneSubmitTrigger: () => void;
  setActiveField: (field: "barcode" | "quantity" | null) => void;
  activeField: "barcode" | "quantity" | null;
};

export const TerminalHeader = ({
  setCustomerId,
  grandTotal,
  onAddToCartClick,
  onDoneSubmitTrigger,
  setActiveField,
  activeField,
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
        className={`overflow-hidden relative z-20 flex flex-col mb-2 sm:mb-4 rounded-xl w-full text-foreground shadow-sm transition-all duration-300 border ${borderColor === "border-transparent" ? "border-border" : borderColor} bg-card/50`}
      >
        <div className="flex flex-col sm:flex-row items-stretch w-full min-h-[180px] sm:min-h-[280px]">
          {/* LEFT SECTION: Cashier, Customer, Tools - Hidden on mobile except Customer */}
          <div className="hidden sm:flex flex-col justify-between p-6 w-[35%] border-r border-border bg-muted/20">
            <div className="space-y-6">
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
          <div className="relative flex-1 p-3 sm:p-6 min-h-[140px] sm:min-h-0 bg-card">

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
                  <span className="font-bold text-3xl md:text-[2.5rem] text-primary tracking-tighter leading-none">
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
        
        {/* BOTTOM SECTION: Shared Input Fields (Desktop Only) */}
        <div className="hidden sm:block w-full border-t border-border bg-muted/10">
          <FormFields
            onAddToCartClick={onAddToCartClick}
            onDoneSubmitTrigger={onDoneSubmitTrigger}
            setActiveField={setActiveField}
            activeField={activeField}
          />
        </div>

        {/* Mobile-only form fields integrated into the header box */}
        <div className="block sm:hidden w-full border-t border-border bg-muted/5">
             <MobileFormFields
                onAddToCartClick={onAddToCartClick}
                setActiveField={setActiveField}
                activeField={activeField}
              />
        </div>
      </div>
    </>
  );
};

export default TerminalHeader;
