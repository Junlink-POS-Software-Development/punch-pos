// app/inventory/components/StocksMonitor.tsx

"use client";

import React, { useState, useMemo } from "react";
import { Column } from "react-data-grid";
import { Loader2, AlertTriangle, PackageCheck } from "lucide-react";
import "react-data-grid/lib/styles.css";
import { DataGrid } from "react-data-grid";
import { InventoryItem } from "./lib/inventory.api";
import { useInventory } from "../../../dashboard/hooks/useInventory";
import { HeaderWithFilter } from "../item-registration/item-table/HeaderWithFilter";
import { InventorySummary } from "@/app/dashboard/components/InventorySummary";

export default function StocksMonitor() {
  const { inventory, isLoading, error } = useInventory();

  // --- Filter & Sort State ---
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sortState, setSortState] = useState<{
    col: keyof InventoryItem | null;
    dir: "ASC" | "DESC" | null;
  }>({ col: null, dir: null });

  // --- Handlers ---
  const handleApplyFilter = (key: string, values: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  const handleSort = (col: keyof InventoryItem, dir: "ASC" | "DESC" | null) => {
    setSortState({ col, dir });
  };

  // --- Derived Data ---
  const processedData = useMemo(() => {
    if (!inventory) return [];

    let data = [...inventory];

    // 1. Apply Filters
    Object.keys(filters).forEach((key) => {
      const selectedValues = filters[key];
      if (selectedValues && selectedValues.length > 0) {
        data = data.filter((item) => {
          const itemValue = String(item[key as keyof InventoryItem]);
          return selectedValues.includes(itemValue);
        });
      }
    });

    // 2. Apply Sort
    if (sortState.col && sortState.dir) {
      data.sort((a, b) => {
        const valA = a[sortState.col!];
        const valB = b[sortState.col!];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortState.dir === "ASC" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortState.dir === "ASC" ? -1 : 1;
        if (strA > strB) return sortState.dir === "ASC" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [inventory, filters, sortState]);

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
  // UPDATED: All widths set to "1fr" for equal distribution
  const columns: Column<InventoryItem>[] = [
    {
      key: "sku",
      name: "SKU",
      width: "1fr", // Equal flexible width
      // FIXED: Renamed headerRenderer to renderHeaderCell
      renderHeaderCell: (props) => (
        <HeaderWithFilter<InventoryItem>
          {...props}
          allData={inventory || []}
          filters={filters}
          onApplyFilter={handleApplyFilter}
          sortState={sortState}
          onSort={handleSort}
        />
      ),
    },
    {
      key: "item_name",
      name: "Item Name",
      width: "1fr", // Equal flexible width
      // FIXED: Renamed headerRenderer to renderHeaderCell
      renderHeaderCell: (props) => (
        <HeaderWithFilter<InventoryItem>
          {...props}
          allData={inventory || []}
          filters={filters}
          onApplyFilter={handleApplyFilter}
          sortState={sortState}
          onSort={handleSort}
        />
      ),
    },
    {
      key: "quantity_in",
      name: "Total In",
      width: "1fr", // Equal flexible width
      renderCell: ({ row }) => (
        <span className="text-green-400/80">+{row.quantity_in}</span>
      ),
      headerCellClass: "cursor-pointer hover:bg-slate-800/50",
    },
    {
      key: "quantity_sold",
      name: "Sold",
      width: "1fr", // Equal flexible width
      renderCell: ({ row }) => (
        <span className="text-blue-400/80">-{row.quantity_sold}</span>
      ),
    },
    {
      key: "quantity_out",
      name: "Pulled Out",
      width: "1fr", // Equal flexible width
      renderCell: ({ row }) => (
        <span className="text-red-400/80">-{row.quantity_out}</span>
      ),
    },
    {
      key: "current_stock",
      name: "Live Stock",
      width: "1fr", // Equal flexible width
      renderCell: ({ row }) => {
        const isLow = row.current_stock <= 5;
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
    <div className="flex flex-col gap-8 p-6 text-slate-200">
      <InventorySummary showNavigation={false} />

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-slate-700 pt-6 border-t">
          <div>
            <h2 className="font-bold text-2xl tracking-wide">
              Detailed Stock Table
            </h2>
            <p className="text-slate-400 text-sm">
              Real-time calculated stock levels for all items
            </p>
          </div>
          <div className="bg-slate-800/50 px-4 py-2 border border-slate-700 rounded font-mono text-xs">
            Total Items:{" "}
            <span className="text-retro-cyan">{processedData.length}</span>
            {processedData.length !== (inventory?.length || 0) && (
              <span className="ml-2 text-slate-500">
                (filtered from {inventory?.length})
              </span>
            )}
          </div>
        </div>

        <div className="border border-slate-700 rounded-lg overflow-hidden glass-effect">
          <DataGrid
            columns={columns}
            rows={processedData}
            rowKeyGetter={(row) => row.item_id}
            className="border-none h-[600px] rdg-dark"
            style={{ height: "75vh" }}
            rowClass={() => "hover:bg-slate-800/30 transition-colors"}
          />
        </div>
      </div>
    </div>
  );
}