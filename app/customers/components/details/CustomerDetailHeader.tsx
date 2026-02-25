import React from "react";
import { ArrowLeft, Search, Edit } from "lucide-react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { useCustomerData } from "../../hooks/useCustomerData";
import { CustomerGroup } from "../../lib/types";
import { UpdateCustomerModal } from "../modals/UpdateCustomerModal";

import { useViewStore } from "../../../../components/window-layouts/store/useViewStore";

export const CustomerDetailHeader = () => {
  const { selectedCustomer } = useCustomerData();
  const { setViewMode, setSelectedCustomerId } = useCustomerStore();
  const { isSplit } = useViewStore();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

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
      <div className="flex justify-between items-center bg-card/30 backdrop-blur-sm px-4 h-full">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={handleBack}
            className="hover:bg-accent shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="font-bold text-[1rem] text-foreground truncate tracking-tight">
              {selectedCustomer.full_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  selectedCustomer.group_id ? "bg-blue-400" : "bg-gray-500"
                }`}
              />
              <p className="border border-foreground/30 px-2 py-0.5 rounded h-fit font-semibold text-[0.6rem] text-muted-foreground truncate uppercase tracking-wider">
                {groupName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 shrink-0 ml-2">
          <div className="relative">
            <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
            <input
              placeholder={isSplit ? "Search..." : "Search invoices..."}
              className={`bg-card py-2 pr-4 pl-9 border border-input focus:border-primary rounded-xl outline-none text-foreground text-sm transition-all ${
                isSplit ? "w-28" : "w-40 lg:w-56"
              }`}
            />
          </div>

          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-blue-900/20 shadow-lg px-3 py-2 rounded-xl font-bold text-white text-sm hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
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
