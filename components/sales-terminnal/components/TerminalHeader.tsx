"use client";

import { useFormContext } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema";
import { useItems } from "@/app/inventory/hooks/useItems";
import { useMemo } from "react";
import { useInventory } from "@/app/dashboard/hooks/useInventory";

import { useAuthStore } from "@/store/useAuthStore";


type TerminalHeaderProps = {
  liveTime: string;
};

export const TerminalHeader = ({ liveTime }: TerminalHeaderProps) => {
  const { watch } = useFormContext<PosFormValues>();
  const { items: allItems } = useItems();
  const { inventory: inventoryData } = useInventory();
  
const {user} = useAuthStore()
  
const currentBarcode = watch("barcode");

  const currentProduct = useMemo(() => {
    if (!currentBarcode) {
      return { name: "NO ITEM", price: "₱0.00", stock: 0 };
    }
    const item = allItems.find((item) => item.sku === currentBarcode);
    if (!item) {
      return { name: "NOT FOUND", price: "₱0.00", stock: 0 };
    }
    const stockInfo = inventoryData?.find((inv) => inv.sku === currentBarcode);
    return {
      name: item.itemName.toUpperCase(),
      price: `₱${item.costPrice.toFixed(2)}`,
      stock: stockInfo?.current_stock ?? 0,
    };
  }, [currentBarcode, allItems, inventoryData]);



  return (
    <div className="flex flex-col justify-center items-center shadow-lg mb-4 px-4 py-1 rounded-md w-full min-h-[180px] font-retro retro-lcd-container retro-scanlines">
      <h1 className="mt-1 font-bold text-retro-cyan text-2xl md:text-3xl uppercase leading-none tracking-widest">
        POINT OF SALE
      </h1>
      <div className="opacity-70 my-1 retro-divider"></div>
      <div className="flex justify-between items-center px-2 w-full text-retro-cyan text-lg md:text-xl leading-none tracking-wide">
        <span className="max-w-[60%] truncate uppercase">{user ? user?.user_metadata?.first_name + " " + user?.user_metadata?.last_name : "Initializing..."}</span>
        <span>{liveTime}</span>
      </div>
      <div className="flex justify-center items-center gap-6 drop-shadow-md my-2 w-full font-bold text-retro-cyan text-3xl md:text-4xl leading-none">
        <span>{currentProduct.name}</span>
        <span className="text-retro-cyan/90">{currentProduct.price}</span>
      </div>
      <div className="opacity-70 my-1 retro-divider"></div>
      <h2 className="mb-1 text-retro-cyan text-lg md:text-xl uppercase leading-none tracking-wide">
        STOCKS AVAILABLE: {currentProduct.stock}
      </h2>
    </div>
  );
};

export default TerminalHeader;