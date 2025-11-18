// app/inventory/components/stock-management/components/TerminalCart.tsx
"use client";

import React from "react";
import { DataGrid, Column } from "react-data-grid";
import { XCircle } from "lucide-react";

// 1. Define the type for a cart item.
// You could also move this to your 'posSchema.ts' file.
export type CartItem = {
  id: string; // Must be unique for react-data-grid (we'll use SKU)
  sku: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

// 2. Define the props our component will receive
type TerminalCartProps = {
  rows: CartItem[];
  onRemoveItem: (sku: string) => void;
};

// 3. Define a local type for formatter props

// 4. Create a custom formatter for the "Delete" button
// 1. Extend Column type with custom props
type DeleteColumn<R> = Column<R> & {
  onRemoveItem: (sku: string) => void;
};

// 2. Update CustomFormatterProps to accept extended column
type CustomFormatterProps<R> = {
  row: R;
  column: DeleteColumn<R>;
};

// 3. Formatter now has strongly typed access
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
  // --- THIS IS THE UPDATED SECTION ---
  const columns: readonly Column<CartItem>[] = [
    {
      key: "sku",
      name: "SKU",
      resizable: true,
      // No 'width' prop = auto-size to fill
    },
    {
      key: "itemName",
      name: "Item Name",
      resizable: true,
      // No 'width' prop = auto-size to fill
    },
    {
      key: "unitPrice",
      name: "Unit Price",
      renderCell: ({ row }) => <span>{row.unitPrice.toFixed(2)}</span>,
      resizable: true,
      // No 'width' prop = auto-size to fill
    },
    {
      key: "quantity",
      name: "Quantity",
      renderCell: ({ row }) => <span>{row.quantity}</span>,
      resizable: true,
      // No 'width' prop = auto-size to fill
    },
    {
      key: "total",
      name: "Total",
      renderCell: ({ row }) => <span>{row.total.toFixed(2)}</span>,
      resizable: true,
      // No 'width' prop = auto-size to fill
    },
    {
      key: "delete",
      name: "Delete",
      width: 60, // <-- Only this column has a fixed width
      resizable: false,
      renderCell: (props) => (
        <DeleteFormatter
          row={props.row}
          column={{ ...props.column, onRemoveItem }}
        />
      ),
    } as DeleteColumn<CartItem>,
  ];
  // --- END OF UPDATED SECTION ---

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      className="w-full h-full rdg-dark" // Use rdg-dark as the base
      headerRowHeight={35}
      rowHeight={30}
      style={
        {
          // Main theme
          "--rdg-background-color": "#1f2937",
          "--rdg-color": "#d1d5db",
          "--rdg-border-color": "#374151",

          // Header
          "--rdg-header-background-color": "#111827",
          "--rdg-header-color": "#9ca3af",

          // Rows
          "--rdg-row-background-color": "#1f2937",
          "--rdg-row-hover-background-color": "#37415L",

          // Cells
          "--rdg-cell-selected-background-color": "#4b5563",

          // Fit container
          border: "none",
          borderRadius: 0,
        } as React.CSSProperties
      }
    />
  );
};

export default TerminalCart;
