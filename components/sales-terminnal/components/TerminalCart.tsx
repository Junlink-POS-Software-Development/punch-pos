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
  onRemoveItem: (sku: string) => void;
  onUpdateItem: (sku: string, updates: Partial<CartItem>) => void;
};

type DeleteColumn<R> = Column<R> & {
  onRemoveItem: (sku: string) => void;
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
      onClick={() => column.onRemoveItem(row.sku)}
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

export const TerminalCart = ({ rows, onRemoveItem, onUpdateItem }: TerminalCartProps) => {
  const { isPriceEditingEnabled } = useSettingsStore();
  const [isEditingActive, setIsEditingActive] = useState(false);

  const columns: readonly Column<CartItem>[] = [
    {
      key: "sku",
      name: "SKU",
      resizable: true,
    },
    {
      key: "itemName",
      name: "Item Name",
      resizable: true,
    },
    {
      key: "unitPrice",
      name: "Unit Price",
      renderHeaderCell: () => (
        <div className="flex items-center gap-2">
          <span>Unit Price</span>
          {isPriceEditingEnabled && (
            <button
              onClick={() => setIsEditingActive(!isEditingActive)}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {isEditingActive ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
          )}
        </div>
      ),
      renderCell: ({ row }) => {
        if (isPriceEditingEnabled && isEditingActive) {
          return (
            <EditablePriceCell 
              initialValue={row.unitPrice} 
              onUpdate={(newPrice) => onUpdateItem(row.sku, { unitPrice: newPrice })} 
            />
          );
        }
        return <span>{row.unitPrice.toFixed(2)}</span>;
      },
      resizable: true,
    },
    {
      key: "quantity",
      name: "Quantity",
      renderCell: ({ row }) => <span>{row.quantity}</span>,
      resizable: true,
    },
    // --- Added Discount Column ---
    {
      key: "discount",
      name: "Discount",
      renderCell: ({ row }) => <span>{(row.discount || 0).toFixed(2)}</span>,
      resizable: true,
    },
    {
      key: "total",
      name: "Total",
      renderCell: ({ row }) => <span>{row.total.toFixed(2)}</span>,
      resizable: true,
    },
    {
      key: "delete",
      name: "Delete",
      width: 60,
      resizable: false,
      renderCell: (props) => (
        <DeleteFormatter
          row={props.row}
          column={{ ...props.column, onRemoveItem }}
        />
      ),
    } as DeleteColumn<CartItem>,
  ];

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      className="w-full h-full rdg-dark"
      headerRowHeight={35}
      rowHeight={30}
      style={
        {
          "--rdg-background-color": "#1f2937",
          "--rdg-color": "#d1d5db",
          "--rdg-border-color": "#374151",
          "--rdg-header-background-color": "#111827",
          "--rdg-header-color": "#9ca3af",
          "--rdg-row-background-color": "#1f2937",
          "--rdg-row-hover-background-color": "#374151", // Fixed typo '37415L' to '374151'
          "--rdg-cell-selected-background-color": "#4b5563",
          border: "none",
          borderRadius: 0,
        } as React.CSSProperties
      }
    />
  );
};

export default TerminalCart;
