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
  const { user } = useAuthStore();

  const currentBarcode = watch("barcode");

  const currentProduct = useMemo(() => {
    if (!currentBarcode) return { name: "NO ITEM", price: "₱0.00", stock: 0 };
    const item = allItems.find((item) => item.sku === currentBarcode);
    if (!item) return { name: "NOT FOUND", price: "₱0.00", stock: 0 };
    const stockInfo = inventoryData?.find((inv) => inv.sku === currentBarcode);
    return {
      name: item.itemName.toUpperCase(),
      price: `₱${item.costPrice.toFixed(2)}`,
      stock: stockInfo?.current_stock ?? 0,
    };
  }, [currentBarcode, allItems, inventoryData]);

  return (
    <div className="glass-effect flex flex-col justify-between items-center mb-4 px-6 py-4 rounded-xl w-full min-h-[200px] text-white shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center w-full text-cyan-400 text-xl font-semibold tracking-widest">
        <span className="font-[family-name:var(--font-geist-sans)]">{user ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : "Initializing..."}</span>
        <span className="font-[family-name:var(--font-geist-mono)]">{liveTime}</span>
      </div>

      {/* Divider */}
      <div className="w-full h-[2px] bg-cyan-400/60 my-2 rounded"></div>

      {/* Item Display */}
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 tracking-wider font-[family-name:var(--font-geist-sans)]">{currentProduct.name}</h1>
        <p className="text-2xl md:text-3xl text-cyan-200 mt-2 font-[family-name:var(--font-geist-mono)] font-bold tracking-tight">{currentProduct.price}</p>
      </div>

      {/* Inventory Status */}
      <div className="mt-4 w-full text-center">
        <p className={`text-lg md:text-xl font-medium tracking-wide font-[family-name:var(--font-geist-mono)] ${currentProduct.stock === 0 ? "text-red-400" : "text-green-400"}`}>
          STOCKS AVAILABLE: {currentProduct.stock}
        </p>
      </div>
    </div>
  );
};


export default TerminalHeader;