// app/inventory/components/ItemTable.tsx

"use client";

import React from "react";
import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css"; // Base RDG styles
import { Item } from "./utils/itemTypes";
import { Edit, Trash2 } from "lucide-react";

interface ItemTableProps {
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

// 1. Define a header class that matches your dark theme's header
const tailwindHeaderClass =
  "bg-transparent text-gray-400 border-b border-gray-700 font-semibold uppercase text-xs";

const getColumns = (
  onEdit: (index: number) => void,
  onDelete: (index: number) => void
): readonly Column<Item>[] => [
  {
    key: "itemName",
    name: "Item Name",
    resizable: true,
    sortable: true,
    headerCellClass: tailwindHeaderClass, // 2. Apply theme class
  },
  {
    key: "sku",
    name: "SKU / Barcode",
    resizable: true,
    sortable: true,
    headerCellClass: tailwindHeaderClass, // 2. Apply theme class
  },
  {
    key: "category",
    name: "Category",
    resizable: true,
    sortable: true,
    renderCell: ({ row }) => row.category || "N/A",
    headerCellClass: tailwindHeaderClass, // 2. Apply theme class
  },
  {
    key: "costPrice",
    name: "Cost Price",
    resizable: true,
    sortable: true,
    width: 120,
    renderCell: ({ row }) => {
      const price = row.costPrice;
      return typeof price === "number" ? `₱${price.toFixed(2)}` : "N/A";
    },
    headerCellClass: tailwindHeaderClass, // 2. Apply theme class
  },
  {
    key: "description",
    name: "Description",
    resizable: true,
    renderCell: ({ row }) => row.description || "N/A",
    headerCellClass: tailwindHeaderClass, // 2. Apply theme class
  },
  {
    key: "actions",
    name: "Actions",
    width: 100,
    headerCellClass: tailwindHeaderClass, // 2. Apply theme class
    renderCell: ({ rowIdx }) => {
      return (
        <div className="flex gap-2">
          {/* 3. Add dark-theme-friendly hover backgrounds */}
          <button
            onClick={() => onEdit(rowIdx)}
            className="hover:bg-blue-400/20 p-1 rounded text-blue-300 hover:text-blue-100"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(rowIdx)}
            className="hover:bg-red-400/20 p-1 rounded text-red-400 hover:text-red-200"
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
      {/* 4. Make the title text light */}
      <h3 className="mb-4 font-semibold text-gray-200 text-lg">
        Registered Items
      </h3>

      <DataGrid<Item>
        columns={columns}
        rows={data}
        rowKeyGetter={(row: Item) => row.id!}
        // 5. Remove all borders and background from the grid container
        className="border-none"
        // 6. Use rowClass to make rows transparent, text light, and add hover
        rowClass={(_, index) =>
          `rdg-row bg-transparent text-[80%] text-gray-200 hover:bg-gray-700/40 border-b border-gray-800`
        }
      />
    </div>
  );
};
