// app/inventory/components/stock-management/components/TerminalCart.tsx
"use client";

import React from "react";
import { DataGrid, Column } from "react-data-grid";
import { XCircle } from "lucide-react";

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
};

type DeleteColumn<R> = Column<R> & {
  onRemoveItem: (sku: string) => void;
};

type CustomFormatterProps<R> = {
  row: R;
  column: DeleteColumn<R>;
};

const DeleteFormatter = ({ row, column }: CustomFormatterProps<CartItem>) => {
  return (
    <button
      className="flex justify-center items-center w-full h-full text-red-500 hover:text-red-300"
      onClick={() => column.onRemoveItem(row.sku)}
      aria-label="Remove item"
    >
      <XCircle size={18} />
    </button>
  );
};

export const TerminalCart = ({ rows, onRemoveItem }: TerminalCartProps) => {
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
      renderCell: ({ row }) => <span>{row.unitPrice.toFixed(2)}</span>,
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
