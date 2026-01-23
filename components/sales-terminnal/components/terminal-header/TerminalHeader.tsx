"use client";

import { CustomerSearchModal } from "../../modals/CustomerSearchModal";
import { useTerminalHeader } from "./hooks/useTerminalHeader";
import { CashierInfo } from "./components/CashierInfo";
import { CustomerSelector } from "./components/CustomerSelector";
import { HeaderToolbar } from "./components/HeaderToolbar";
import { TimeDisplay } from "./components/TimeDisplay";
import { ProductDisplay } from "./components/ProductDisplay";

type TerminalHeaderProps = {
  liveTime: string;
  setCustomerId: (id: string | null) => void;
  grandTotal: number;
};

export const TerminalHeader = ({
  liveTime,
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
        className={`glass-effect flex flex-row items-stretch mb-4 rounded-xl w-full min-h-[180px] text-white shadow-xl transition-all duration-300 border ${borderColor} overflow-hidden bg-slate-900/40`}
      >
        {/* LEFT SECTION: Cashier, Customer, Tools */}
        <div className="flex flex-col justify-between p-5 w-[35%] border-r border-slate-700/50">
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
        <div className="flex flex-col flex-1 p-6 relative">
          {/* Top Row: Total & Time */}
          <div className="flex justify-between items-start w-full mb-4">
            <div className="flex flex-col">
               <span className="text-slate-400 text-xs uppercase tracking-widest mb-1">Grand Total</span>
               <span className="font-bold text-5xl text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                 ₱{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
            </div>
            
            <div className="text-right">
               <TimeDisplay
                  liveTime={liveTime}
                  isBackdating={isBackdating}
                  customTransactionDate={customTransactionDate}
                  setCustomTransactionDate={setCustomTransactionDate}
                />
            </div>
          </div>

          {/* Bottom Row: Product Display / Status */}
          <div className="mt-auto flex justify-end">
             <ProductDisplay
                currentProduct={currentProduct}
                isBackdating={isBackdating}
              />
          </div>
        </div>
      </div>
    </>
  );
};

export default TerminalHeader;
