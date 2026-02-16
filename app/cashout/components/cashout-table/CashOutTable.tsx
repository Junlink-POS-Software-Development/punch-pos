"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Search } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onClear?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export default function CashOutTable<TData, TValue>({
  columns,
  data,
  onClear,
  onLoadMore,
  hasMore,
  isLoadingMore,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
        pagination: {
            pageSize: 10,
        }
    }
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
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
                    <td colSpan={columns.length} className="text-center py-16">
                        <div className="flex flex-col items-center text-muted-foreground">
                            <div className="bg-muted p-4 rounded-full mb-3">
                                <Search size={32} className="opacity-50" />
                            </div>
                            <p className="font-medium">No cashout records found</p>
                            <p className="text-xs mt-1 text-muted-foreground/70">Transactions will appear here once recorded</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
       

      
      {/* Infinite Scroll / Load More Control */}
      {hasMore && (
        <div className="p-4 border-t border-border flex justify-center bg-muted/20">
            <button 
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 flex items-center gap-2"
            >
                {isLoadingMore ? "Loading more..." : "Load More Records"}
            </button>
        </div>
      )}

    </div>
  );
}
