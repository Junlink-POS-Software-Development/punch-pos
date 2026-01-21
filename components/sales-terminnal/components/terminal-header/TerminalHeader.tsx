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
        className={`glass-effect flex flex-row items-stretch mb-4 rounded-xl w-full min-h-[260px] text-white shadow-xl transition-all duration-300 border ${borderColor} overflow-hidden`}
      >
        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col justify-between bg-slate-900/40 p-5 border-slate-700/50 border-r w-[30%] min-w-[250px]">
          <CashierInfo user={user} statusColor={statusColor} />

          <CustomerSelector
            customerName={customerName || ""}
            isCustomerSelected={!!isCustomerSelected}
            onSearchOpen={() => setIsSearchOpen(true)}
            onClearCustomer={handleClearCustomer}
          />

          <HeaderToolbar />
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="relative flex flex-col grow p-6">
          <div className="flex justify-between items-start w-full mb-2">
            {/* Grand Total Display (Left) */}
            <div className="flex flex-col items-start">
              <span className="text-slate-400 text-xs uppercase tracking-widest mb-1">Grand Total</span>
              <span className="font-bold text-4xl md:text-6xl text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                ₱{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Time Display (Right) */}
            <div className="flex flex-col items-end">
              <TimeDisplay
                liveTime={liveTime}
                isBackdating={isBackdating}
                customTransactionDate={customTransactionDate}
                setCustomTransactionDate={setCustomTransactionDate}
              />
            </div>
          </div>

          <div className="mt-auto">
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
