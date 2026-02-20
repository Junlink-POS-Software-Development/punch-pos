import React, { useMemo, useState } from "react";
import { Loader2, ArrowUpDown } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { InventoryItem } from "../lib/inventory.api";

interface StocksDataGridProps {
  inventory: InventoryItem[];
  columns: any[]; // Kept for prop compatibility if needed, but we'll define internal columns
  isFetchingNextPage: boolean;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  isLoading: boolean;
  isError: boolean;
}

export function StocksDataGrid({
  inventory,
  isFetchingNextPage,
  onScroll,
  isLoading,
  isError,
}: StocksDataGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columnHelper = createColumnHelper<InventoryItem>();

  const tableColumns = useMemo(
    () => [
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => (
          <span className="font-mono text-xs">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("item_name", {
        header: "Item Name",
        cell: (info) => (
          <div className="flex items-center gap-2">
             <div className="h-6 w-6 shrink-0 bg-muted rounded border border-border flex items-center justify-center overflow-hidden">
                {info.row.original.image_url && (
                  <img src={info.row.original.image_url} alt="" className="h-full w-full object-cover" />
                )}
             </div>
            <span className="font-medium text-foreground">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("quantity_in", {
        header: "Total In",
        cell: (info) => (
          <span className="font-mono text-emerald-500">
            +{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("quantity_sold", {
        header: "Sold",
        cell: (info) => (
          <span className="font-mono text-blue-500">
            -{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("quantity_manual_out", {
        header: "Pulled Out",
        cell: (info) => (
          <span className="font-mono text-destructive">
            -{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("current_stock", {
        header: "Live Stock",
        cell: (info) => {
            const val = info.getValue() as number;
            const isLowStock = val <= (info.row.original.low_stock_threshold || 10);
            
            return (
                <div className={`flex items-center gap-2 ${isLowStock ? "text-red-500" : "text-emerald-500"}`}>
                   {isLowStock ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                   ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9"/></svg>
                   )}
                   <span className="font-mono font-bold">
                        {val}
                   </span>
                </div>
            )
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: inventory,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading && inventory.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-red-500">
        Error loading stocks data. Please try again.
      </div>
    );
  }

  return (
    <div
      className="border border-border rounded-lg overflow-hidden relative shadow-sm flex flex-col h-full bg-card"
    >
      <div className="overflow-auto flex-1" onScroll={onScroll}>
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
                  );
                })}
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
                      className="px-4 py-1.5 border-b border-border text-xs"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No inventory items found.
                </td>
              </tr>
            )}
            {isFetchingNextPage && (
                 <tr>
                 <td colSpan={tableColumns.length} className="px-4 py-4 text-center">
                   <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Loading more...</span>
                   </div>
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
