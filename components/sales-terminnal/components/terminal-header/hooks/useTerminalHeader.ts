import { useState, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { PosFormValues } from "../../../utils/posSchema";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { useAuthStore } from "@/store/useAuthStore";
import { useTransactionStore } from "@/app/settings/backdating/stores/useTransactionStore";
import { usePermissions } from "@/app/hooks/usePermissions";
import { CustomerResult } from "../../../modals/CustomerSearchModal";

export const useTerminalHeader = (setCustomerId: (id: string | null) => void) => {
  const { watch, setValue } = useFormContext<PosFormValues>();
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();
  const { user } = useAuthStore();
  const { customTransactionDate, setCustomTransactionDate } = useTransactionStore();

  // State for Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Fetch Store ID
  useEffect(() => {
    const fetchStoreId = async () => {
      if (!user?.id) return;
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("users")
        .select("store_id")
        .eq("user_id", user.id)
        .single();
      
      if (data && !error) {
        setStoreId(data.store_id);
      }
    };
    fetchStoreId();
  }, [user?.id]);

  // Watch values
  const currentBarcode = watch("barcode");
  const customerName = watch("customerName");

  // Hotkey Listener (Alt + F1)
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "F1") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  // Handle Selection
  const handleCustomerSelect = (customer: CustomerResult) => {
    setValue("customerName", customer.full_name, { shouldValidate: true });
    setCustomerId(customer.id);
  };

  // Clear Customer
  const handleClearCustomer = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setValue("customerName", "");
    setCustomerId(null);
  };

  const handleCustomerNameChange = (name: string) => {
    setValue("customerName", name);
    if (name === "") {
        setCustomerId(null);
    }
  };

  const currentProduct = useMemo(() => {
    if (!currentBarcode) return { name: "ITEM NAME", price: "₱0.00", stock: 0 };
    const item = allItems.find((item) => item.sku === currentBarcode);
    if (!item) return { name: "NOT FOUND", price: "₱0.00", stock: 0 };
    const stockInfo = inventoryData?.find((inv) => inv.sku === currentBarcode);
    return {
      name: (item.itemName || "UNKNOWN").toUpperCase(),
      price: `₱${(item.sellingPrice ?? item.salesPrice ?? 0).toFixed(2)}`,
      stock: stockInfo?.current_stock ?? 0,
    };
  }, [currentBarcode, allItems, inventoryData]);

  const { can_backdate } = usePermissions();
  const isBackdating = can_backdate && !!customTransactionDate;

  return {
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
    storeId, // <--- Return storeId
    handleCustomerNameChange,
  };
};
