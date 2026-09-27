import React, { useState, useEffect } from "react";
import { ProductDisplay } from "../components/terminal-header/components/ProductDisplay";
import { MobileCustomerInput } from "./MobileCustomerInput";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Palette } from "lucide-react";

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
  onOpenThemeModal?: () => void;
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
  onOpenThemeModal,
}: MobileHeaderProps) => {
  const isCustomerCrmDisabled = useSettingsStore((s) => s.isCustomerCrmDisabled);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showCustomer = mounted ? !isCustomerCrmDisabled : true;

  return (
    <div className="flex flex-col sm:hidden gap-2 h-full">
      {/* Customer Input & Theme Customizer Bar */}
      {(onOpenThemeModal || showCustomer) && (
        <div className="flex items-center justify-between gap-2 mb-1 w-full">
          {onOpenThemeModal && (
            <button
              type="button"
              onClick={onOpenThemeModal}
              className="p-1.5 rounded-lg bg-muted/50 border border-border text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 shrink-0"
              title="Theme Settings"
            >
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold">Theme</span>
            </button>
          )}
          {showCustomer && (
            <div className="flex-1 flex justify-end">
              <MobileCustomerInput
                customerName={customerName || ""}
                isCustomerSelected={isCustomerSelected}
                onSearchOpen={onSearchOpen}
                onClearCustomer={onClearCustomer}
                onCustomerNameChange={onCustomerNameChange}
              />
            </div>
          )}
        </div>
      )}

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
