"use client";

import React from "react";
import { Column } from "react-data-grid";
import { Loader2, AlertTriangle, PackageCheck } from "lucide-react";
import "react-data-grid/lib/styles.css";
import { DataGrid } from "react-data-grid";
import { InventoryItem } from "./lib/inventory.api";
import { useInventory } from "../../hooks/useInventory";

export default function StocksMonitor() {
  // Use shared inventory context
  const {
    inventory,
    isLoading,
    error,
  } = useInventory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-retro-cyan animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400">Error loading stocks data.</div>;
  }

  // --- Grid Configuration ---
  const columns: Column<InventoryItem>[] = [
    { key: "sku", name: "SKU", width: 120 },
    { key: "item_name", name: "Item Name", width: 200 },
    {
      key: "quantity_in",
      name: "Total In",
      width: 100,
      renderCell: ({ row }) => (
        <span className="text-green-400/80">+{row.quantity_in}</span>
      ),
    },
    {
      key: "quantity_sold",
      name: "Sold",
      width: 100,
      renderCell: ({ row }) => (
        <span className="text-blue-400/80">-{row.quantity_sold}</span>
      ),
    },
    {
      key: "quantity_out",
      name: "Pulled Out",
      width: 110,
      renderCell: ({ row }) => (
        <span className="text-red-400/80">-{row.quantity_out}</span>
      ),
    },
    {
      key: "current_stock",
      name: "Live Stock",
      width: 120,
      renderCell: ({ row }) => {
        const isLow = row.current_stock <= 5; // Low stock threshold
        return (
          <div
            className={`flex items-center gap-2 font-bold ${
              isLow ? "text-red-500" : "text-green-500"
            }`}
          >
            {isLow ? <AlertTriangle size={14} /> : <PackageCheck size={14} />}
            {row.current_stock}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6 text-slate-200">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-bold text-2xl tracking-wide">Stocks Monitor</h2>
          <p className="text-slate-400 text-sm">
            Real-time calculated stock levels
          </p>
        </div>
        <div className="bg-slate-800/50 px-4 py-2 border border-slate-700 rounded font-mono text-xs">
          Total Items:{" "}
          <span className="text-retro-cyan">{inventory?.length || 0}</span>
        </div>
      </div>

      <div className="border border-slate-700 rounded-lg overflow-hidden glass-effect">
        <DataGrid
          columns={columns}
          rows={inventory || []}
          rowKeyGetter={(row) => row.item_id}
          className="border-none h-[600px] rdg-dark"
          rowClass={() => "hover:bg-slate-800/30 transition-colors"}
        />
      </div>
    </div>
  );
}
