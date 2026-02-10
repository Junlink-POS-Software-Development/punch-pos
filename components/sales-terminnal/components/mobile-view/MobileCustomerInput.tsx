// Mobile-specific customer input with search
import React from "react";
import { Search, XCircle, User } from "lucide-react";

interface MobileCustomerInputProps {
  customerName: string;
  isCustomerSelected: boolean;
  onSearchOpen: () => void;
  onClearCustomer: () => void;
  onCustomerNameChange: (name: string) => void;
}

export const MobileCustomerInput = ({
  customerName,
  isCustomerSelected,
  onSearchOpen,
  onClearCustomer,
  onCustomerNameChange,
}: MobileCustomerInputProps) => {
  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg border border-input px-2 py-1.5 w-full">
      <User className="w-4 h-4 text-muted-foreground shrink-0" />
      <input
        type="text"
        placeholder="Walk-in Customer"
        value={customerName || ""}
        onChange={(e) => onCustomerNameChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none min-w-0"
      />
      {isCustomerSelected || (customerName && customerName !== "Walk-in Customer") ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClearCustomer();
          }}
          className="p-1 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      ) : null}
      
      <button
        type="button"
        onClick={onSearchOpen}
        className="p-1 hover:bg-primary/10 rounded-full text-muted-foreground hover:text-primary transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
    </div>
  );
};
