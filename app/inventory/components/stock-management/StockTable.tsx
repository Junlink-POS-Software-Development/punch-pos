"use client";

import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useStocks } from "./context/StockContext";
import { StockData } from "./lib/stocks.api";
import { Edit, Trash2 } from "lucide-react";

interface StockTableProps {
  onEdit?: (item: StockData) => void;
}

export default function StockTable({ onEdit }: StockTableProps) {
  const { stocks, removeStockEntry, isLoading } = useStocks();

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this record?")) {
      removeStockEntry(id);
    }
  };

  const headerClass =
    "bg-transparent text-gray-400 border-b border-gray-700 font-semibold uppercase text-xs flex items-center backdrop-blur-2xl";

  const cellClass =
    "truncate text-gray-300 text-xs h-full flex items-center px-2";

  const uniformWidth = 160;

  const columns: Column<StockData>[] = [
    {
      key: "item_name",
      name: "Item Name",
      headerCellClass: headerClass,
      cellClass: cellClass,
      width: uniformWidth,
      renderCell: ({ row }) => <span>{row.item_name}</span>,
    },
    {
      key: "flow",
      name: "Flow",
      headerCellClass: headerClass,
      cellClass: (row) =>
        `${cellClass} ${
          row.flow === "stock-in" ? "text-green-400" : "text-red-400"
        }`,
      width: 100,
    },
    {
      key: "quantity",
      name: "Qty",
      headerCellClass: headerClass,
      cellClass: cellClass,
      width: 100,
    },
    {
      key: "capital_price",
      name: "Capital Price",
      headerCellClass: headerClass,
      cellClass: cellClass,
      width: uniformWidth,
      renderCell: ({ row }) => (
        <span>₱{Number(row.capital_price).toFixed(2)}</span>
      ),
    },
    {
      key: "notes",
      name: "Notes",
      headerCellClass: headerClass,
      cellClass: cellClass,
      width: uniformWidth,
    },
    {
      key: "time_stamp",
      name: "Date",
      headerCellClass: headerClass,
      cellClass: cellClass,
      width: 200,
      renderCell: ({ row }) => (
        <span>{new Date(row.time_stamp).toLocaleString()}</span>
      ),
    },
    {
      key: "actions",
      name: "Actions",
      width: 100,
      headerCellClass: headerClass,
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2 h-full">
          <button
            onClick={() => onEdit && onEdit(row)}
            className="group hover:bg-blue-400/20 p-1.5 rounded-md text-blue-400 hover:text-blue-200 transition-all"
            title="Edit Record"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="group hover:bg-red-400/20 p-1.5 rounded-md text-red-400 hover:text-red-200 transition-all"
            title="Delete Record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading)
    return <div className="p-4 text-gray-400">Loading stocks...</div>;

  return (
    <DataGrid
      columns={columns}
      rows={stocks}
      rowKeyGetter={(row) => row.id}
      className="border-none"
      style={{ height: "63vh" }}
      rowClass={(_, index) =>
        `rdg-row bg-transparent text-[80%] text-gray-200 hover:bg-gray-700/40 border-b border-gray-800 backdrop-blur-2xl`
      }
    />
  );
}
