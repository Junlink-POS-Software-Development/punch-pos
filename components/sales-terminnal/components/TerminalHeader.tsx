// components/sales-terminnal/components/TerminalHeader.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { PosFormValues } from "../utils/posSchema";
import { useItems } from "@/app/inventory/components/item-registration/context/ItemsContext";
import { useMemo } from "react";

type TerminalHeaderProps = {
  userName: string;
  liveTime: string;
};

export const TerminalHeader = ({ userName, liveTime }: TerminalHeaderProps) => {
  const { watch } = useFormContext<PosFormValues>();
  const { items: allItems } = useItems();
  
  // Watch the barcode field for changes
  const currentBarcode = watch("barcode");
  
  // Find the product based on the current barcode
  const currentProduct = useMemo(() => {
    if (!currentBarcode) {
      return {
        name: "NO ITEM",
        price: "₱0.00",
      };
    }
    
    const item = allItems.find((item) => item.sku === currentBarcode);
    
    if (!item) {
      return {
        name: "NOT FOUND",
        price: "₱0.00",
      };
    }
    
    return {
      name: item.itemName.toUpperCase(),
      price: `₱${item.costPrice.toFixed(2)}`,
    };
  }, [currentBarcode, allItems]);

  return (
    <div className="flex flex-col justify-center items-center shadow-lg mb-4 px-4 py-1 rounded-md w-full min-h-[180px] font-retro retro-lcd-container retro-scanlines">
      <h1 className="mt-1 font-bold text-retro-cyan text-2xl md:text-3xl uppercase leading-none tracking-widest">
        POINT OF SALE
      </h1>
      <div className="opacity-70 my-1 retro-divider"></div>
      <div className="flex justify-between items-center px-2 w-full text-retro-cyan text-lg md:text-xl leading-none tracking-wide">
        <span className="max-w-[60%] truncate uppercase">{userName}</span>
        <span>{liveTime}</span>
      </div>
      <div className="flex justify-center items-center gap-6 drop-shadow-md my-2 w-full font-bold text-retro-cyan text-3xl md:text-4xl leading-none">
        <span>{currentProduct.name}</span>
        <span className="text-retro-cyan/90">{currentProduct.price}</span>
      </div>
    </div>
  );
};

export default TerminalHeader;
