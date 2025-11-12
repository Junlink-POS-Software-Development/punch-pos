// app/inventory/components/ItemTable.tsx

"use client";

import React from "react";
// ---
// vvv FIX 1: 'DataGrid' is a named export, not a default export
// ---
import { DataGrid, Column } from "react-data-grid";
// ---
import "react-data-grid/lib/styles.css"; // Base RDG styles
import { Item } from "./utils/itemTypes";
import { Edit, Trash2 } from "lucide-react"; // Import icons

interface ItemTableProps {
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

// getColumns definition (no changes needed)
const getColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void
): readonly Column<Item>[] => [
  {
    key: "itemName",
    name: "Item Name",
    resizable: true,
    sortable: true,
  },
  {
    key: "sku",
    name: "SKU / Barcode",
    resizable: true,
    sortable: true,
  },
  {
    key: "category",
    name: "Category",
    resizable: true,
    sortable: true,
    renderCell: ({ row }) => row.category || "N/A",
  },
  {
    key: "costPrice",
    name: "Cost Price",
    resizable: true,
    sortable: true,
    width: 120,
    renderCell: ({ row }) => {
      const price = row.costPrice;
      return typeof price === "number" ? `$${price.toFixed(2)}` : "N/A";
    },
  },
  {
    key: "description",
    name: "Description",
    resizable: true,
    renderCell: ({ row }) => row.description || "N/A",
  },
  {
    key: "actions",
    name: "Actions",
    width: 100,
    renderCell: ({ rowIdx }) => {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(rowIdx)}
            className="p-1 text-blue-300 hover:text-blue-100"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(rowIdx)}
            className="p-1 text-red-400 hover:text-red-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];

export const ItemTable: React.FC<ItemTableProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  const columns = React.useMemo(
    () => getColumns(onEdit, onDelete),
    [onEdit, onDelete]
  );

  return (
    <div className="overflow-x-auto">
      <h3 className="mb-4 font-semibold text-lg">Registered Items</h3>
      <DataGrid<Item>
        columns={columns}
        rows={data}
        rowKeyGetter={(row: Item) => row.id!}
        className="rdg-light"
      />
    </div>
  );
};
