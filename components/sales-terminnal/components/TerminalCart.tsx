// app/inventory/components/stock-management/components/TerminalCart.tsx
"use client";

import React, { useState } from "react";
import { DataGrid, Column } from "react-data-grid";
import { XCircle, Lock, Unlock } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

// 1. Updated CartItem type to include 'discount'
export type CartItem = {
  id: string;
  sku: string;
  itemName: string;
  unitPrice: number;
  discount: number; // <-- Added this field
  quantity: number;
  total: number;
};

type TerminalCartProps = {
  rows: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
};

type DeleteColumn<R> = Column<R> & {
  onRemoveItem: (id: string) => void;
};

type CustomFormatterProps<R> = {
  row: R;
  column: DeleteColumn<R>;
};

export const DeleteFormatter = ({ row, column }: CustomFormatterProps<CartItem>) => {
  return (
    <button
      type="button"
      className="flex justify-center items-center w-full h-full text-red-500 hover:text-red-300"
      onClick={() => column.onRemoveItem(row.id)}
      aria-label="Remove item"
    >
      <XCircle size={18} />
    </button>
  );
};

const EditablePriceCell = ({ 
  initialValue, 
  onUpdate 
}: { 
  initialValue: number; 
  onUpdate: (val: number) => void; 
}) => {
  const [value, setValue] = useState(initialValue.toString());
  const [error, setError] = useState(false);

  // Sync with external changes
  React.useEffect(() => {
    setValue(initialValue.toString());
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    
    // Check if it's a valid number
    if (newVal === "" || isNaN(Number(newVal))) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleBlur = () => {
    if (error || value === "") {
      // Reset to original value if invalid
      setValue(initialValue.toString());
      setError(false);
    } else {
      // Commit valid value
      onUpdate(Number(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      className={`w-full bg-slate-800 text-white px-1 py-0.5 rounded border outline-none text-right transition-colors ${
        error 
          ? "border-red-500 focus:border-red-500" 
          : "border-slate-600 focus:border-cyan-500"
      }`}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      autoFocus
    />
  );
};

const INITIAL_RATIOS: Record<string, number> = {
  sku: 0.15,
  itemName: 0.35,
  unitPrice: 0.15,
  quantity: 0.1,
  discount: 0.1,
  total: 0.15
};

const FIXED_ACTION_WIDTH = 45;

export const TerminalCart = ({ rows, onRemoveItem, onUpdateItem }: TerminalCartProps) => {
  const { isPriceEditingEnabled } = useSettingsStore();
  const [isEditingActive, setIsEditingActive] = useState(false);
  
  // State for column ratios
  const [ratios, setRatios] = useState<Record<string, number>>(INITIAL_RATIOS);
  
  // State for container measurement
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Load saved ratios on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("terminal-cart-column-ratios");
      if (saved) {
        setRatios(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load column ratios", e);
    }
  }, []);

  // Measure container width
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleColumnResize = (idx: any, width: number) => {
     if (containerWidth <= FIXED_ACTION_WIDTH) return;
     const availableWidth = containerWidth - FIXED_ACTION_WIDTH;
     
     // Identify the resized column
     const colKey = idx.key || (idx as any).column?.key; 
     if (colKey === "delete") return;
     
     const oldRatio = ratios[colKey];
     if (oldRatio === undefined) return;

     const newRatio = Math.max(0.05, Math.min(0.9, width / availableWidth)); 
     const delta = newRatio - oldRatio;

     if (Math.abs(delta) < 0.0001) return;

     // Distribute delta to columns to the RIGHT
     const orderedKeys = ["sku", "itemName", "unitPrice", "quantity", "discount", "total"];
     const resizeIdx = orderedKeys.indexOf(colKey);
     if (resizeIdx === -1) return;

     const rightKeys = orderedKeys.slice(resizeIdx + 1);
     
     if (rightKeys.length === 0) return; 

     // Calculate total weight of right columns to distribute proportionally
     const totalRightWeight = rightKeys.reduce((sum, key) => sum + ratios[key], 0);
     
     if (totalRightWeight <= 0.01) return; 

     const newRatios: Record<string, number> = { ...ratios, [colKey]: newRatio };

     rightKeys.forEach(key => {
        const share = ratios[key] / totalRightWeight;
        const reduction = delta * share;
        newRatios[key] = Math.max(0.02, ratios[key] - reduction); 
     });
     
     // Normalize to ensure sum is exactly 1 
     const totalNewWeight = orderedKeys.reduce((sum, key) => sum + newRatios[key], 0);
     orderedKeys.forEach(key => {
        newRatios[key] = newRatios[key] / totalNewWeight;
     });

     setRatios(newRatios);
     localStorage.setItem("terminal-cart-column-ratios", JSON.stringify(newRatios));
  };

  const columns = React.useMemo((): readonly Column<CartItem>[] => {
    const availableWidth = Math.max(100, containerWidth - FIXED_ACTION_WIDTH);
    
    // Helper to get pixels
    const getW = (key: string) => Math.floor((ratios[key] || 0.1) * availableWidth);

    return [
      {
        key: "sku",
        name: "SKU",
        width: getW("sku"),
        resizable: true,
      },
      {
        key: "itemName",
        name: "Item Name",
        width: getW("itemName"),
        resizable: true,
      },
      {
        key: "unitPrice",
        name: "Price",
        width: getW("unitPrice"),
        renderHeaderCell: () => (
          <div className="flex items-center gap-1">
            <span>Price</span>
            {isPriceEditingEnabled && (
              <button
                type="button"
                onClick={() => setIsEditingActive(prev => !prev)}
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {isEditingActive ? <Unlock size={12} /> : <Lock size={12} />}
              </button>
            )}
          </div>
        ),
        renderCell: ({ row }) => {
          if (isPriceEditingEnabled && isEditingActive) {
            return (
              <EditablePriceCell 
                initialValue={row.unitPrice} 
                onUpdate={(newPrice) => onUpdateItem(row.id, { unitPrice: newPrice })} 
              />
            );
          }
          return <span>{row.unitPrice.toFixed(2)}</span>;
        },
        resizable: true,
      },
      {
        key: "quantity",
        name: "Qty",
        width: getW("quantity"),
        renderCell: ({ row }) => <span>{row.quantity}</span>,
        resizable: true,
      },
      {
        key: "discount",
        name: "Disc",
        width: getW("discount"),
        renderCell: ({ row }) => <span>{(row.discount || 0).toFixed(2)}</span>,
        resizable: true,
      },
      {
        key: "total",
        name: "Total",
        width: getW("total"),
        renderCell: ({ row }) => <span>{row.total.toFixed(2)}</span>,
        resizable: true,
      },
      {
        key: "delete",
        name: "Act", 
        width: FIXED_ACTION_WIDTH,
        resizable: false,
        renderCell: (props) => (
          <DeleteFormatter
            row={props.row}
            column={{ ...props.column, onRemoveItem }}
          />
        ),
      } as DeleteColumn<CartItem>,
    ];
  }, [isPriceEditingEnabled, isEditingActive, onRemoveItem, onUpdateItem, ratios, containerWidth]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
        <DataGrid
          columns={columns}
          rows={rows}
          onColumnResize={handleColumnResize}
          className="w-full h-full rdg-custom border-none"
          headerRowHeight={35}
          rowHeight={30}
          style={
            {
              "--rdg-background-color": "transparent",
              "--rdg-color": "var(--color-foreground)",
              "--rdg-border-color": "var(--color-border)",
              "--rdg-header-background-color": "var(--color-muted)",
              "--rdg-header-color": "var(--color-muted-foreground)",
              "--rdg-row-background-color": "transparent",
              "--rdg-row-hover-background-color": "var(--color-muted) / 0.5",
              "--rdg-cell-selected-background-color": "var(--color-primary) / 0.1",
              border: "none",
              borderRadius: 0,
            } as React.CSSProperties
          }
        />
    </div>
  );
};

export default TerminalCart;
