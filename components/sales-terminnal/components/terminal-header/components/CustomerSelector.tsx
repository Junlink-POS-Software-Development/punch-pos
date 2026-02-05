import { User, Users, XCircle, Search } from "lucide-react";

interface CustomerSelectorProps {
  customerName: string;
  isCustomerSelected: boolean;
  onSearchOpen: () => void;
  onClearCustomer: (e: React.MouseEvent) => void;
}

export const CustomerSelector = ({
  customerName,
  isCustomerSelected,
  onSearchOpen,
  onClearCustomer,
}: CustomerSelectorProps) => {
  return (
    <div className="group flex flex-col my-3">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
          Customer
        </span>
        <span className="hidden group-hover:inline-block text-[9px] text-primary/70 animate-pulse">
          ALT + F1 to Search
        </span>
      </div>

      <button
        onClick={onSearchOpen}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-dashed transition-all duration-200 text-left ${
          isCustomerSelected
            ? "bg-primary/10 border-primary/50 text-primary"
            : "bg-muted/50 border-input text-muted-foreground hover:bg-muted/80 hover:border-primary/50 hover:text-primary"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {isCustomerSelected ? (
            <Users className="w-4 h-4 shrink-0" />
          ) : (
            <User className="opacity-50 w-4 h-4 shrink-0" />
          )}
          <span
            className={`text-xs font-medium truncate ${
              isCustomerSelected ? "" : "italic"
            }`}
          >
            {customerName || "Walk-in Customer"}
          </span>
        </div>

        {isCustomerSelected ? (
          <div
            role="button"
            onClick={onClearCustomer}
            className="hover:bg-red-500/20 p-1 rounded-full text-muted-foreground/50 hover:text-red-500 transition-colors"
          >
            <XCircle className="w-3 h-3" />
          </div>
        ) : (
          <Search className="opacity-0 group-hover:opacity-50 w-3 h-3" />
        )}
      </button>
    </div>
  );
};
