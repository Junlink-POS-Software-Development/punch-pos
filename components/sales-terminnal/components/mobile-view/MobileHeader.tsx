// Mobile Header Component
import React from "react";
import { ProductDisplay } from "../terminal-header/components/ProductDisplay";
import { MobileCustomerInput } from "./MobileCustomerInput";

interface MobileHeaderProps {
  customerName: string;
  isCustomerSelected: boolean;
  onSearchOpen: () => void;
  onClearCustomer: () => void;
  onCustomerNameChange: (name: string) => void;
  currentProduct: {
    name: string;
    price: string;
    stock: number;
  };
  grandTotal: number;
  isBackdating: boolean;
}

export const MobileHeader = ({
  customerName,
  isCustomerSelected,
  onSearchOpen,
  onClearCustomer,
  onCustomerNameChange,
  currentProduct,
  grandTotal,
  isBackdating,
}: MobileHeaderProps) => {
  return (
    <div className="flex flex-col sm:hidden gap-2 h-full">
      {/* Customer Input - Top Right */}
      <div className="flex justify-end mb-1 w-full">
        <MobileCustomerInput
          customerName={customerName || ""}
          isCustomerSelected={isCustomerSelected}
          onSearchOpen={onSearchOpen}
          onClearCustomer={onClearCustomer}
          onCustomerNameChange={onCustomerNameChange}
        />
      </div>

      {/* Product Info & Grand Total */}
      <div className="flex items-center justify-between gap-2 flex-1">
        {/* Product Info - Mobile - Left */}
        <div className="flex-1 min-w-0">
          <ProductDisplay
            currentProduct={currentProduct}
            isBackdating={isBackdating}
          />
        </div>
        {/* Grand Total - Mobile - Right */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-muted-foreground text-[10px] uppercase tracking-widest">
            Grand Total
          </span>
          <span className="font-bold text-2xl text-primary tracking-tighter">
            ₱
            {grandTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
