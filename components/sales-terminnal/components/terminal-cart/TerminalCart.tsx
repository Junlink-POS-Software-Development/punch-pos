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
import { Lock, Unlock, XCircle, Tag, ShieldCheck, X, CreditCard, ChefHat, Utensils, Divide } from "lucide-react";
import { EditablePriceCell } from "./EditablePriceCell";
import { CartItem, TerminalCartProps } from "./types";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePermissions } from "@/app/hooks/usePermissions";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";

export const TerminalCart = ({
  rows,
  onRemoveItem,
  onUpdateItem,
  onItemDiscountClick,
  onItemModifierClick,
  onOrderDiscountClick,
  orderDiscountAmount,
  orderDiscountValue,
  orderDiscountType,
  onRemoveOrderDiscount,
  onCharge,
  onSendKitchen,
  onSplitCheck,
}: TerminalCartProps) => {
  const { isPriceEditingEnabled } = useSettingsStore();
  const { can_edit_price } = usePermissions();
  const { modules, isPharmacy, isRestaurant } = useBusinessMode();
  const canEditPrice = isPriceEditingEnabled && can_edit_price;
  const [isEditingActive, setIsEditingActive] = useState(false);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const subtotal = useMemo(() => rows.reduce((acc, r) => acc + (r.total || 0), 0), [rows]);
  const hasStatutory = modules.statutory_sc_pwd || isPharmacy;

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
        cell: ({ row, getValue }) => {
          const item = row.original;
          return (
            <div className="flex flex-col py-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-foreground truncate">
                  {getValue()}
                </span>
                {item.isRx && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-black bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 tracking-wider">
                    Rx
                  </span>
                )}
                {(isRestaurant || modules.kitchen_display) && item.course && (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                    {item.course}
                  </span>
                )}
                {(isRestaurant || modules.kitchen_display) && item.kitchenStatus === "sent" && (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                    Sent to Kitchen
                  </span>
                )}
                {(isRestaurant || modules.menu_modifiers) && onItemModifierClick && (
                  <button
                    type="button"
                    onClick={() => onItemModifierClick(item)}
                    className="p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Customize item / modifiers"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Modifiers List */}
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {item.modifiers.map((mod, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    >
                      {mod.optionName}
                      {mod.priceAdjustment > 0
                        ? ` (+₱${mod.priceAdjustment.toFixed(2)})`
                        : ""}
                    </span>
                  ))}
                </div>
              )}

              {/* Special Prep Notes */}
              {item.notes && (
                <span className="text-[10px] text-red-600 dark:text-red-400 italic mt-0.5">
                  Note: {item.notes}
                </span>
              )}

              {item.genericName && (
                <span className="text-[11px] text-muted-foreground/80 italic truncate">
                  {item.genericName} {item.dosage ? `• ${item.dosage}` : ''}
                </span>
              )}
              {item.batchNumber && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  Lot: {item.batchNumber} {item.expiryDate ? `• Exp: ${item.expiryDate}` : ''}
                </span>
              )}
            </div>
          );
        },
        size: 250, // Generous default
        minSize: 100,
      }),
      columnHelper.accessor("unitPrice", {
        // We override header to include lock toggle
        header: () => (
            <div className="flex items-center justify-end gap-1">
              <span>Price</span>
              {canEditPrice && (
                <button
                  type="button"
                  onClick={() => setIsEditingActive((prev) => !prev)}
                  className="text-muted-foreground hover:text-primary transition-colors"
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
                {canEditPrice && isEditingActive ? (
                   <div style={{ width: 80 }}>
                    <EditablePriceCell
                        initialValue={getValue()}
                        onUpdate={(newPrice) =>
                        onUpdateItem(row.original.id, { unitPrice: newPrice })
                        }
                    />
                   </div>
                ) : (
                    <span>{(getValue() ?? 0).toFixed(2)}</span>
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
        cell: ({ row, getValue }) => {
          const item = row.original;
          const discValue = getValue() || 0;
          const label = item.discountType === 'percent'
            ? `${item.discountValue}%`
            : discValue > 0 ? discValue.toFixed(2) : '0.00';
          return (
            <div
              className={`text-right cursor-pointer rounded px-1 -mx-1 transition-colors ${
                discValue > 0 ? 'text-red-500 font-semibold hover:bg-red-500/10' : 'text-muted-foreground hover:bg-muted/50'
              }`}
              onClick={() => onItemDiscountClick?.(item)}
              title="Click to edit discount"
            >
              {label}
            </div>
          );
        },
        size: 60,
        minSize: 40,
      }),
      columnHelper.accessor("total", {
        header: () => <div className="text-right">Total</div>,
        cell: ({ getValue }) => <div className="text-right">{(getValue() ?? 0).toFixed(2)}</div>,
        size: 80,
        minSize: 60,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-center">Act</div>,
        cell: ({ row }) => (
          <div className="flex justify-center relative z-10">
            <button
              type="button"
              className="text-red-500 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-muted/50"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Removing item:", row.original.id);
                onRemoveItem(row.original.id);
              }}
              onMouseDown={(e) => e.stopPropagation()} // Prevent row selection logic if any
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
    [canEditPrice, isEditingActive, onRemoveItem, onUpdateItem, columnHelper]
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
          <thead className="sticky top-0 z-10 bg-muted text-foreground font-semibold backdrop-blur-md shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b-2 border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="relative px-2 py-3 select-none group font-bold tracking-wider uppercase text-[10px] border-r border-border/20 last:border-r-0"
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
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary touch-none select-none z-5
                           ${header.column.getIsResizing() ? "bg-primary opacity-100" : "bg-muted opacity-0 group-hover:opacity-100"}
                        `}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted transition-colors">
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
                    <td colSpan={columns.length} className="h-32 text-center text-muted-foreground italic p-4">
                        No items in cart
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cart Summary & Action Footer Bar */}
      <div className="p-3 bg-muted/40 border-t border-border flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Order Discount Button */}
          {onOrderDiscountClick && (
            <button
              type="button"
              onClick={onOrderDiscountClick}
              disabled={rows.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer ${
                orderDiscountValue
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted border-border text-foreground"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>
                {orderDiscountValue
                  ? `Disc: ${orderDiscountType === 'percent' ? `${orderDiscountValue}%` : `₱${orderDiscountValue}`}`
                  : "Add Discount"}
              </span>
            </button>
          )}

          {/* Senior / PWD Statutory 20% Button */}
          {hasStatutory && onOrderDiscountClick && (
            <button
              type="button"
              onClick={onOrderDiscountClick}
              disabled={rows.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer ${
                orderDiscountType === 'percent' && orderDiscountValue === 20
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600/30"
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Senior / PWD (20%)</span>
            </button>
          )}

          {/* Restaurant: Send to Kitchen Button */}
          {(isRestaurant || modules.kitchen_display) && onSendKitchen && (
            <button
              type="button"
              onClick={onSendKitchen}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer"
              title="Send Open Order to Kitchen / KDS"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Send Kitchen</span>
            </button>
          )}

          {/* Restaurant: Split Check Button */}
          {(isRestaurant || modules.split_check) && onSplitCheck && (
            <button
              type="button"
              onClick={onSplitCheck}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer"
              title="Split check equally or by items"
            >
              <Divide className="w-3.5 h-3.5" />
              <span>Split Bill</span>
            </button>
          )}

          {/* Remove Discount Button */}
          {orderDiscountValue && onRemoveOrderDiscount && (
            <button
              type="button"
              onClick={onRemoveOrderDiscount}
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Remove discount"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Cart Total Display & Checkout Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
              {rows.length} {rows.length === 1 ? "item" : "items"}
            </span>
            <span className="font-mono text-base font-bold text-foreground">
              ₱{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {onCharge && (
            <button
              type="button"
              onClick={onCharge}
              disabled={rows.length === 0}
              className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              title="Charge / Process Payment (F2)"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Charge</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// export default removed (named export already exists)
