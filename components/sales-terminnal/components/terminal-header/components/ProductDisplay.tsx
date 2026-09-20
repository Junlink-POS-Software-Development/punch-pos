import React from "react";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import { ShieldAlert, Hash } from "lucide-react";

interface ProductDisplayProps {
  currentProduct: {
    name: string;
    price: string;
    stock: number;
    sku?: string;
    genericName?: string;
    dosage?: string;
    formulation?: string;
    isRx?: boolean;
    brandType?: "branded" | "generic";
    batchNumber?: string;
    expiryDate?: string;
  };
  isBackdating: boolean;
}

export const ProductDisplay = ({
  currentProduct,
  isBackdating,
}: ProductDisplayProps) => {
  const { isPharmacy, modules } = useBusinessMode();
  const isPharmaMode = isPharmacy || modules.prescription_rx || !!currentProduct.genericName;
  const isSelected = currentProduct.name !== "ITEM NAME" && currentProduct.name !== "NOT FOUND";

  // Specialized Pharmacy Medication Header
  if (isPharmaMode && isSelected) {
    return (
      <div className="flex flex-col items-start justify-center h-full w-full py-0.5 animate-in fade-in duration-200">
        {/* Top Badges: Branded vs Generic, Rx vs OTC, Dosage */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {currentProduct.brandType && (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                currentProduct.brandType === "generic"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
              }`}
            >
              {currentProduct.brandType === "generic" ? "💊 Generic Medicine" : "🏷️ Branded Medicine"}
            </span>
          )}

          {currentProduct.isRx ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Rx Required
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
              OTC
            </span>
          )}

          {currentProduct.dosage && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              {currentProduct.dosage}
            </span>
          )}

          {currentProduct.formulation && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-foreground border border-border">
              {currentProduct.formulation}
            </span>
          )}
        </div>

        {/* Item Name & Price */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1
            className={`text-xl md:text-3xl font-bold tracking-tight font-lexend line-clamp-1 ${
              isBackdating ? "text-amber-500" : "text-foreground"
            }`}
          >
            {currentProduct.name}
          </h1>
          <p
            className={`pos-total-glow text-2xl md:text-3xl font-lexend font-black tracking-tight ${
              isBackdating ? "text-amber-600" : "text-primary"
            }`}
          >
            {currentProduct.price}
          </p>
        </div>

        {/* Active Generic Molecule Subtitle */}
        {currentProduct.genericName && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate max-w-full">
            <span className="font-bold text-foreground/80">Generic Molecule:</span>
            <span className="italic text-primary font-medium">{currentProduct.genericName}</span>
          </div>
        )}

        {/* Stocks & Lot Number */}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border ${
              currentProduct.stock === 0
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : "bg-green-500/10 text-green-600 border-green-500/20"
            }`}
          >
            STOCKS: {currentProduct.stock}
          </div>

          {currentProduct.batchNumber && (
            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3 text-emerald-500" />
              Lot: {currentProduct.batchNumber}
              {currentProduct.expiryDate ? ` • Exp: ${currentProduct.expiryDate}` : ""}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Classic Retail Display
  return (
    <div className="flex flex-col items-start justify-center h-full">
      <div className="flex flex-col justify-center items-start mt-0 text-left">
        <h1
          className={`text-1xl md:text-4xl font-bold tracking-tight font-lexend drop-shadow-sm transition-colors line-clamp-2 max-w-full ${
            isBackdating ? "text-amber-500" : "text-foreground"
          }`}
        >
          {currentProduct.name}
        </h1>
        <p
          className={`pos-total-glow text-2xl md:text-4xl font-lexend font-black tracking-tighter transition-all duration-300 ${
            isBackdating ? "text-amber-600" : "text-primary"
          }`}
        >
          {currentProduct.price}
        </p>
      </div>

      <div className="flex justify-start mt-2">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
            currentProduct.stock === 0
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-green-500/10 text-green-600 border-green-500/20"
          }`}
        >
          STOCKS: {currentProduct.stock}
        </div>
      </div>
    </div>
  );
};
