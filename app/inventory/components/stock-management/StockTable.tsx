// app/inventory/components/stock-management/StockTable.tsx

"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import { useStocks } from "../../hooks/useStocks";
import { StockData } from "./lib/stocks.api";
import {
  Edit,
  Trash2,
  LineChart,
  Plus,
  XCircle,
  Search,
  Layers,
  ArrowUpDown,
} from "lucide-react";

interface StockTableProps {
  onEdit?: (item: StockData) => void;
  onAdd?: () => void;
  isAdding?: boolean;
  onBatchAdd?: () => void;
}

export default function StockTable({
  onEdit,
  onAdd,
  isAdding,
  onBatchAdd,
}: StockTableProps) {
  const { stocks, removeStockEntry, isLoading } = useStocks();
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this record?")) {
      removeStockEntry(id);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return stocks;
    const term = searchTerm.toLowerCase();
    return stocks.filter(
      (s) =>
        s.item_name?.toLowerCase().includes(term) ||
        s.notes?.toLowerCase().includes(term)
    );
  }, [stocks, searchTerm]);

  const columnHelper = createColumnHelper<StockData>();

  const columns = useMemo<ColumnDef<StockData, any>[]>(
    () => [
      columnHelper.accessor("item_name", {
        header: "Item Name",
        cell: (info) => (
          <span className="font-medium text-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("flow", {
        header: "Flow",
        meta: { align: "center" },
        cell: (info) => (
          <div className="flex justify-center">
            <span
              className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                info.getValue() === "stock-in"
                  ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-red-500/20 text-red-500 border border-red-500/30"
              }`}
            >
              {info.getValue().replace("-", " ")}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("quantity", {
        header: "Qty",
        meta: { align: "right" },
        cell: (info) => (
          <span className="font-mono text-foreground block text-right">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("capital_price", {
        header: "Cap. Price",
        meta: { align: "right" },
        cell: (info) => (
          <span className="font-mono text-primary block text-right">
            ₱{(info.getValue() ?? 0).toFixed(2)}
          </span>
        ),
      }),
      columnHelper.accessor("notes", {
        header: "Notes",
        cell: (info) => (
          <span
            title={info.getValue() || ""}
            className="opacity-70 truncate text-muted-foreground max-w-[200px] block"
          >
            {info.getValue() || "—"}
          </span>
        ),
      }),
      columnHelper.accessor("time_stamp", {
        header: "Date / Time",
        meta: { align: "right" },
        cell: (info) => (
          <span className="block text-right">{new Date(info.getValue()).toLocaleString()}</span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        cell: (info) => (
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => onEdit && onEdit(info.row.original)}
              className="group hover:bg-primary/20 p-1.5 rounded-md text-primary hover:text-primary transition-all"
              title="Edit Record"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleDelete(info.row.original.id)}
              className="group hover:bg-destructive/20 p-1.5 rounded-md text-destructive hover:text-destructive transition-all"
              title="Delete Record"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      }),
    ],
    [onEdit]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border p-4 shadow-sm">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 pb-2 border-border border-b gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg text-foreground uppercase tracking-tight font-lexend">
              Stocks Flow
            </h3>
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
                    <span className="bg-primary-foreground/20 px-1.5 py-0.5 rounded text-[10px] border border-primary-foreground/30 opacity-80 ml-2">
                      Tab
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
          Showing{" "}
          <span className="text-foreground font-bold">
            {filteredData.length}
          </span>{" "}
          of {stocks.length} records
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-muted-foreground text-sm animate-pulse">
          Loading stock data...
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-border rounded-lg">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                     const align = (header.column.columnDef.meta as any)?.align || "left";
                     return (
                    <th
                      key={header.id}
                      className={`px-4 py-2 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary transition-colors ${
                        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className={`flex items-center gap-1 w-full ${
                         align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"
                      }`}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ArrowUpDown size={12} className="text-primary" />,
                          desc: (
                            <ArrowUpDown
                              size={12}
                              className="text-primary transform rotate-180"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? (
                          <ArrowUpDown
                            size={12}
                            className="text-muted-foreground/50"
                          />
                        )}
                      </div>
                    </th>
                  )})}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/50">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-1.5 border-b border-border text-xs text-muted-foreground"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No stock records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
