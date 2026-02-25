import { Search, UserPlus } from "lucide-react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { useCustomerData } from "../../hooks/useCustomerData";
import { usePermissions } from "@/app/hooks/usePermissions";

export const CustomerHeader = () => {
  const { customers, currentGroupName } = useCustomerData();
  const { searchTerm, setSearchTerm, openCustomerModal } = useCustomerStore();
  const { can_manage_customers } = usePermissions();

  return (
    <div className="flex justify-between items-center bg-card/30 backdrop-blur-sm p-2 px-8 border-border border-b h-fit">
      <div>
        <h1 className="font-bold text-foreground text-2xl tracking-tight">
          {currentGroupName}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {customers.length} records found
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name..."
            className="bg-card py-2.5 pr-4 pl-10 border border-input focus:border-primary rounded-xl outline-none w-full text-foreground text-sm transition-all"
          />
        </div>
        {can_manage_customers && (
          <button
            onClick={openCustomerModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 shadow-lg px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:scale-105 active:scale-95 transition-all"
          >
            <UserPlus size={18} /> Add Customer
          </button>
        )}
      </div>
    </div>
  );
};
