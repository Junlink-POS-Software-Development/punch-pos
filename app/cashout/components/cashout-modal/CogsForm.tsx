"use client";

import React, { useEffect } from "react";
import { Truck, PackagePlus, Plus, Trash2, Calendar, Layers } from "lucide-react";
import { CashoutInput, CashoutStockItem } from "../../lib/cashout.api";
import ItemAutoComplete from "@/utils/ItemAutoComplete";
import { InventoryItem } from "@/app/inventory/components/stocks-monitor/lib/inventory.api";

interface CogsFormProps {
  data: Partial<CashoutInput>;
  onChange: (data: Partial<CashoutInput>) => void;
}

export const CogsForm = ({ data, onChange }: CogsFormProps) => {
  const isStockIn = data.is_stock_in ?? true;
  const stockItems: CashoutStockItem[] = data.stock_items && data.stock_items.length > 0
    ? data.stock_items
    : [{ item_id: "", item_name: data.product || "", quantity: 1, expiry_date: "" }];

  // Keep stock_items and is_stock_in synced to parent on initial render
  useEffect(() => {
    if (data.is_stock_in === undefined || !data.stock_items) {
      onChange({
        ...data,
        is_stock_in: isStockIn,
        stock_items: stockItems,
      });
    }
  }, []);

  const handleStockInToggle = (checked: boolean) => {
    onChange({
      ...data,
      is_stock_in: checked,
    });
  };

  const handleUpdateStockItem = (index: number, updatedFields: Partial<CashoutStockItem>) => {
    const updated = [...stockItems];
    updated[index] = { ...updated[index], ...updatedFields };

    // If first item changes name and product is empty or matches previous, sync product
    const primaryProduct = updated[0]?.item_name || data.product || "";
    onChange({
      ...data,
      product: primaryProduct,
      stock_items: updated,
    });
  };

  const handleAddItem = () => {
    const updated = [...stockItems, { item_id: "", item_name: "", quantity: 1, expiry_date: "" }];
    onChange({
      ...data,
      stock_items: updated,
    });
  };

  const handleRemoveItem = (index: number) => {
    if (stockItems.length <= 1) return;
    const updated = stockItems.filter((_, i) => i !== index);
    onChange({
      ...data,
      stock_items: updated,
      product: updated[0]?.item_name || "",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, nextField: string) => {
    if (e.key === "Enter") {
      if (e.shiftKey) return;
      e.preventDefault();
      
      const nextInput = document.querySelector(`[name="${nextField}"]`) as HTMLElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* ─── Supplier / Receipt Section ──────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-primary bg-primary/10 w-fit px-3 py-1 rounded-full text-xs font-semibold">
          <Truck size={14} /> Supplier & Invoice Info
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Receipt / Invoice No.
            </label>
            <input 
              name="receipt_no"
              className="w-full border-input rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-ring border bg-muted/20 focus:bg-card text-foreground transition-all" 
              placeholder="INV-0001"
              value={data.receipt_no || ""}
              onChange={(e) => onChange({ ...data, receipt_no: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "manufacturer")}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Manufacturer / Supplier
            </label>
            <input 
              name="manufacturer"
              className="w-full border-input rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-ring border bg-muted/20 focus:bg-card text-foreground transition-all" 
              placeholder="e.g. Nestlé, San Miguel"
              value={data.manufacturer || ""}
              onChange={(e) => onChange({ ...data, manufacturer: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "brand")}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Brand
            </label>
            <input 
              name="brand"
              className="w-full border-input rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-ring border bg-muted/20 focus:bg-card text-foreground transition-all" 
              placeholder="e.g. KitKat, Bear Brand"
              value={data.brand || ""}
              onChange={(e) => onChange({ ...data, brand: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, "item_name_0")}
            />
          </div>
        </div>
      </div>

      {/* ─── Inventory Stock-In Configuration ────────────────────────────── */}
      <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isStockIn ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
              <PackagePlus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Stock-In Recording</h3>
              <p className="text-[11px] text-muted-foreground">
                {isStockIn 
                  ? "Items will be added to inventory stock & logged in Manage Stocks"
                  : "Audit only: Transaction will be logged in Manage Stocks without adding inventory stock"}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isStockIn}
              onChange={(e) => handleStockInToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className={`ml-2 text-xs font-bold ${isStockIn ? "text-primary" : "text-muted-foreground"}`}>
              {isStockIn ? "Stock In Enabled" : "Audit Only"}
            </span>
          </label>
        </div>

        {/* ─── Items List ──────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers size={13} /> Items Received ({stockItems.length})
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {stockItems.map((item, index) => (
            <div 
              key={index}
              className="bg-card border border-border/70 rounded-xl p-3 shadow-xs space-y-3 relative group"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                
                {/* Item Autocomplete Search */}
                <div className="md:col-span-6 relative z-30">
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Select Item / Product Name *
                  </label>
                  <ItemAutoComplete
                    id={`item_name_${index}`}
                    value={item.item_name}
                    onChange={(val) => handleUpdateStockItem(index, { item_name: val })}
                    onBlur={() => {}}
                    showChevron={true}
                    onItemSelect={(selected: InventoryItem) => {
                      handleUpdateStockItem(index, {
                        item_id: selected.item_id,
                        item_name: selected.item_name,
                      });
                      const nextQty = document.querySelector(`[name="quantity_${index}"]`) as HTMLElement;
                      if (nextQty) nextQty.focus();
                    }}
                    className="w-full bg-muted/20 focus:bg-card border border-input text-foreground text-sm rounded-lg p-2 focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                  />
                </div>

                {/* Quantity Input */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name={`quantity_${index}`}
                    min="1"
                    className="w-full bg-muted/20 focus:bg-card border border-input text-foreground font-semibold text-sm rounded-lg p-2 focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                    placeholder="1"
                    value={item.quantity || ""}
                    onChange={(e) => handleUpdateStockItem(index, { quantity: Math.max(1, parseInt(e.target.value) || 0) })}
                    onKeyDown={(e) => handleKeyDown(e, `expiry_date_${index}`)}
                  />
                </div>

                {/* Expiry Date Input */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar size={12} /> Expiry Date
                    </label>
                    <input
                      type="date"
                      name={`expiry_date_${index}`}
                      className="w-full bg-muted/20 focus:bg-card border border-input text-foreground text-xs rounded-lg p-2 focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                      value={item.expiry_date || ""}
                      onChange={(e) => handleUpdateStockItem(index, { expiry_date: e.target.value })}
                      onKeyDown={(e) => {
                        if (index === stockItems.length - 1) {
                          handleKeyDown(e, "specs");
                        } else {
                          handleKeyDown(e, `item_name_${index + 1}`);
                        }
                      }}
                    />
                  </div>

                  {stockItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="mt-5 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Specifications & Details ────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Specifications / Delivery Details <span className="text-muted-foreground/60 font-normal lowercase">(optional)</span>
        </label>
        <textarea 
          name="specs"
          className="w-full border-input rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-ring border bg-muted/20 focus:bg-card text-foreground transition-all" 
          rows={2} 
          placeholder="e.g. 24 packs x 40g box, batch #2026-A"
          value={data.specs || ""}
          onChange={(e) => onChange({ ...data, specs: e.target.value })}
          onKeyDown={(e) => handleKeyDown(e, "notes")}
        ></textarea>
      </div>
    </div>
  );
};

