// app/inventory/components/stock-management/StockTable.tsx

"use client";

import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useStocks } from "../../hooks/useStocks";
import { StockData } from "./lib/stocks.api";
import { Edit, Trash2, LineChart } from "lucide-react";

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
      width: 120,
      headerCellClass: headerClass,
      cellClass: cellClass,
      renderCell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
            row.flow === "stock-in"
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {row.flow.replace("-", " ")}
        </span>
      ),
    },
    {
      key: "quantity",
      name: "Qty",
      width: 80,
      headerCellClass: headerClass,
      cellClass: cellClass,
      renderCell: ({ row }) => (
        <span className="font-mono">{row.quantity}</span>
      ),
    },
    {
      key: "capital_price",
      name: "Cap. Price",
      width: 120,
      headerCellClass: headerClass,
      cellClass: cellClass,
      renderCell: ({ row }) => (
        <span className="font-mono text-emerald-400">
          ₱{row.capital_price.toFixed(2)}
        </span>
      ),
    },
    {
      key: "notes",
      name: "Notes",
      headerCellClass: headerClass,
      cellClass: cellClass,
      width: 250,
      renderCell: ({ row }) => (
        <span title={row.notes || ""} className="opacity-70 truncate">
          {row.notes || "—"}
        </span>
      ),
    },
    {
      key: "time_stamp",
      name: "Date / Time",
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

  return (
    <div className="flex flex-col h-[85vh]">
      {/* ADDED: Title Header */}
      <div className="flex items-center gap-2 mb-4 pb-2 border-slate-700/50 border-b">
        <LineChart className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-lg text-slate-200">Stocks Flow</h3>
      </div>

      {isLoading ? (
        <div className="p-4 text-gray-400 text-sm animate-pulse">
          Loading stock data...
        </div>
      ) : (
        <div className="flex-1 min-h-[400px]">
           <DataGrid
            className="border-gray-800 bg-gray-900/30 rdg-dark text-xs h-[calc(100vh-100px)]"
            columns={columns}
            rows={stocks}
            rowHeight={50}
            headerRowHeight={50}
            style={{ height: "80vh" }}
          />
        </div>
      )}
    </div>
  );
}