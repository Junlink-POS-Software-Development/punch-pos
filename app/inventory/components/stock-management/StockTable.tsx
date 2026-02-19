// app/inventory/components/stock-management/StockTable.tsx

"use client";

import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { useStocks } from "../../hooks/useStocks";
import { StockData } from "./lib/stocks.api";
import { Edit, Trash2, LineChart, Plus, XCircle, Search, Layers } from "lucide-react";
import { useMemo, useState } from "react";

interface StockTableProps {
  onEdit?: (item: StockData) => void;
  onAdd?: () => void;
  isAdding?: boolean;
  onBatchAdd?: () => void;
}

export default function StockTable({ onEdit, onAdd, isAdding, onBatchAdd }: StockTableProps) {
  const { stocks, removeStockEntry, isLoading } = useStocks();
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this record?")) {
      removeStockEntry(id);
    }
  };

  const filteredStocks = useMemo(() => {
    if (!searchTerm.trim()) return stocks;
    const term = searchTerm.toLowerCase();
    return stocks.filter(
      (s) =>
        s.item_name?.toLowerCase().includes(term) ||
        s.notes?.toLowerCase().includes(term)
    );
  }, [stocks, searchTerm]);

  const headerClass =
    "bg-muted/80 text-muted-foreground border-b border-border font-semibold uppercase text-xs flex items-center backdrop-blur-md";

  const cellClass =
    "truncate text-muted-foreground text-xs h-full flex items-center px-2";

  const uniformWidth = 160;

  const columns: Column<StockData>[] = [
    {
      key: "item_name",
      name: "Item Name",
      headerCellClass: headerClass,
      cellClass: `${cellClass} text-foreground font-medium`,
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
              ? "bg-green-500/20 text-green-500 border border-green-500/30"
              : "bg-red-500/20 text-red-500 border border-red-500/30"
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
        <span className="font-mono text-foreground">{row.quantity}</span>
      ),
    },
    {
      key: "capital_price",
      name: "Cap. Price",
      width: 120,
      headerCellClass: headerClass,
      cellClass: cellClass,
      renderCell: ({ row }) => (
        <span className="font-mono text-primary">
          ₱{(row.capital_price ?? 0).toFixed(2)}
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
        <span title={row.notes || ""} className="opacity-70 truncate text-muted-foreground">
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
            className="group hover:bg-primary/20 p-1.5 rounded-md text-primary hover:text-primary transition-all"
            title="Edit Record"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="group hover:bg-destructive/20 p-1.5 rounded-md text-destructive hover:text-destructive transition-all"
            title="Delete Record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-[85vh] bg-card rounded-xl border border-border p-4 shadow-sm">
      {/* ADDED: Title Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 pb-2 border-border border-b gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground uppercase tracking-tight font-lexend">Stocks Flow</h3>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background border border-input rounded-lg pl-9 pr-4 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-input transition-all w-64 shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            {onBatchAdd && (
              <button
                onClick={onBatchAdd}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-foreground transition-all shadow-sm bg-primary hover:bg-primary/90 active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Batch Update</span>
              </button>
            )}

            {onAdd && (
              <button
                onClick={onAdd}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-foreground transition-all shadow-sm active:scale-95 ${
                  isAdding 
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isAdding ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    Close Form
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stock Entry</span>
                    <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded text-[10px] border border-primary-foreground/30 opacity-80 ml-2">Tab</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
          Showing <span className="text-foreground font-bold">{filteredStocks.length}</span> of {stocks.length} records
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-muted-foreground text-sm animate-pulse">
          Loading stock data...
        </div>
      ) : (
        <div className="flex-1 min-h-[400px]">
           <DataGrid
            className="border-none bg-transparent rdg-custom text-xs h-[calc(100vh-100px)]"
            columns={columns}
            rows={filteredStocks}
            rowHeight={50}
            headerRowHeight={50}
            style={{ 
              height: "80vh",
              // @ts-ignore
              "--rdg-header-background-color": "var(--color-muted)",
              "--rdg-row-hover-background-color": "var(--color-muted) / 0.5",
              "--rdg-color": "var(--color-foreground)",
              "--rdg-background-color": "var(--color-card)",
              "--rdg-border-color": "var(--color-border)",
            }}
          />
        </div>
      )}
    </div>
  );
}
