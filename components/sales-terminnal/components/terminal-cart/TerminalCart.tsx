"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  ColumnSizingState,
} from "@tanstack/react-table";
import { XCircle, Lock, Unlock } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { CartItem, TerminalCartProps } from "./types";
import { EditablePriceCell } from "./EditablePriceCell";

export const TerminalCart = ({
  rows,
  onRemoveItem,
  onUpdateItem,
}: TerminalCartProps) => {
  const { isPriceEditingEnabled } = useSettingsStore();
  const [isEditingActive, setIsEditingActive] = useState(false);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Load persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("terminal-cart-tanstack-sizing");
      if (saved) {
        setColumnSizing(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load table sizing", e);
    }
  }, []);

  // Save persistence
  // Tanstack uses an updater pattern for sizing state
  const onColumnSizingChange = (updater: any) => {
      setColumnSizing((old) => {
          const newState = typeof updater === 'function' ? updater(old) : updater;
          localStorage.setItem("terminal-cart-tanstack-sizing", JSON.stringify(newState));
          return newState;
      });
  };

  const columnHelper = createColumnHelper<CartItem>();

  const columns = useMemo<ColumnDef<CartItem, any>[]>(
    () => [
      columnHelper.accessor("sku", {
        header: "SKU",
        size: 90,
        minSize: 60,
      }),
      columnHelper.accessor("itemName", {
        header: "Item Name",
        size: 250, // Generous default
        minSize: 100,
      }),
      columnHelper.accessor("unitPrice", {
        // We override header to include lock toggle
        header: () => (
            <div className="flex items-center justify-end gap-1">
              <span>Price</span>
              {isPriceEditingEnabled && (
                <button
                  type="button"
                  onClick={() => setIsEditingActive((prev) => !prev)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Toggle Price Edit"
                >
                  {isEditingActive ? <Unlock size={12} /> : <Lock size={12} />}
                </button>
              )}
            </div>
        ),
        cell: ({ row, getValue }) => {
          return (
             <div className="flex items-center justify-end gap-2">
                {isPriceEditingEnabled && isEditingActive ? (
                   <div style={{ width: 80 }}>
                    <EditablePriceCell
                        initialValue={getValue()}
                        onUpdate={(newPrice) =>
                        onUpdateItem(row.original.id, { unitPrice: newPrice })
                        }
                    />
                   </div>
                ) : (
                    <span>{getValue().toFixed(2)}</span>
                )}
             </div>
          );
        },
        size: 90,
        minSize: 70,
      }),
      columnHelper.accessor("quantity", {
        header: () => <div className="text-center">Qty</div>,
        cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        size: 50,
        minSize: 40,
      }),
      columnHelper.accessor("discount", {
        header: () => <div className="text-right">Disc</div>,
        cell: ({ getValue }) => <div className="text-right">{(getValue() || 0).toFixed(2)}</div>,
        size: 60,
        minSize: 40,
      }),
      columnHelper.accessor("total", {
        header: () => <div className="text-right">Total</div>,
        cell: ({ getValue }) => <div className="text-right">{getValue().toFixed(2)}</div>,
        size: 80,
        minSize: 60,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-center">Act</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <button
              type="button"
              className="text-red-500 hover:text-red-300 transition-colors"
              onClick={() => onRemoveItem(row.original.id)}
              aria-label="Remove item"
            >
              <XCircle size={18} />
            </button>
          </div>
        ),
        size: 50,
        minSize: 40,
        enableResizing: false,
      }),
    ],
    [isPriceEditingEnabled, isEditingActive, onRemoveItem, onUpdateItem, columnHelper]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      columnSizing,
    },
    onColumnSizingChange: onColumnSizingChange,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
      <div className="flex-1 overflow-auto w-full relative">
        <table className="w-full text-sm text-left border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className="sticky top-0 z-10 bg-slate-900/90 text-slate-400 font-medium backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-700">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative px-2 py-2 select-none group font-medium"
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {/* Resizer Handle */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-cyan-500 touch-none select-none z-20
                           ${header.column.getIsResizing() ? "bg-cyan-500 opacity-100" : "bg-slate-700/50 opacity-0 group-hover:opacity-100"}
                        `}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2 py-1.5 truncate relative"
                      style={{
                        width: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
                // Empty State Row
                <tr>
                    <td colSpan={columns.length} className="h-32 text-center text-slate-500 italic p-4">
                        No items in cart
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TerminalCart;
