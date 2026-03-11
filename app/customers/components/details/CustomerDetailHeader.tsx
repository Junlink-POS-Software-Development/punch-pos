import { ArrowLeft, Search, Edit } from "lucide-react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { useCustomerData } from "../../hooks/useCustomerData";
import { CustomerGroup } from "../../lib/types";
import { UpdateCustomerModal } from "../modals/UpdateCustomerModal";

import { useViewStore } from "../../../../components/window-layouts/store/useViewStore";
import { useState } from "react";

export const CustomerDetailHeader = () => {
  const { selectedCustomer } = useCustomerData();
  const { setViewMode, setSelectedCustomerId } = useCustomerStore();
  const { isSplit } = useViewStore();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleBack = () => {
    setViewMode("list");
    setSelectedCustomerId(null);
  };

  if (!selectedCustomer) return null;

  const groupName = selectedCustomer.group
    ? (selectedCustomer.group as CustomerGroup).name
    : "Ungrouped";

  return (
    <>
      <div className="flex justify-between items-center bg-card/40 backdrop-blur-md px-4 lg:px-6 h-full transition-all border-border border-b">
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">

          <button
            onClick={handleBack}
            className="hover:bg-accent shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all active:scale-95"
            title="Back to list"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="font-bold text-sm lg:text-[1rem] text-foreground truncate tracking-tight leading-none">
              {selectedCustomer.full_name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  selectedCustomer.group_id ? "bg-blue-400" : "bg-muted"
                }`}
              />
              <p className="border border-border bg-accent/30 px-2 py-0.5 rounded text-[0.6rem] font-bold text-muted-foreground truncate uppercase tracking-wider">
                {groupName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 lg:gap-3 shrink-0 ml-2">
          <div className="relative hidden sm:block">
            <Search className="top-1/2 left-3.5 absolute w-3.5 h-3.5 text-muted-foreground -translate-y-1/2" />
            <input
              placeholder={isSplit ? "Search..." : "Search invoices..."}
              className={`bg-background/50 hover:bg-background py-2 pr-4 pl-9 border border-input focus:ring-1 focus:ring-ring focus:border-primary rounded-xl outline-none text-foreground text-sm transition-all placeholder:text-muted-foreground/50 ${
                isSplit ? "w-28" : "w-40 lg:w-56"
              }`}
            />
          </div>

          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-3 lg:px-4 py-2 rounded-xl font-bold text-primary-foreground text-sm hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap"
          >
            <Edit size={16} />
            {!isSplit && <span className="hidden sm:inline">Update</span>}
          </button>
        </div>
      </div>

      {isUpdateModalOpen && (
        <UpdateCustomerModal
          customer={selectedCustomer}
          onClose={() => setIsUpdateModalOpen(false)}
        />
      )}
    </>
  );
};
