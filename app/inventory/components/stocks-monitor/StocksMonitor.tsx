// app/inventory/components/StocksMonitor.tsx

"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import "react-data-grid/lib/styles.css";
import { DataGrid } from "react-data-grid";
import { useInventory } from "../../../dashboard/hooks/useInventory";
import { InventorySummary } from "@/app/dashboard/components/InventorySummary";
import { useStocksLogic } from "./hooks/useStocksLogic";
import { getStocksColumns } from "./components/Columns";


export default function StocksMonitor() {
  const { inventory, isLoading, error } = useInventory();
  
  // Custom hook handles filtering/sorting state and logic
  const { 
    processedData, 
    filters, 
    sortState, 
    handleApplyFilter, 
    handleSort 
  } = useStocksLogic(inventory);

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

  const columns = getStocksColumns({
    inventory: inventory || [],
    filters,
    sortState,
    onApplyFilter: handleApplyFilter,
    onSort: handleSort,
  });

  return (
    <div className="flex flex-col gap-8 p-6 text-slate-200">
      <InventorySummary showNavigation={false} />

      <div className="flex flex-col gap-4">
        <HeaderSection 
          totalCount={processedData.length} 
          originalCount={inventory?.length || 0} 
        />

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

// Sub-component for the header section to keep the main return clean
function HeaderSection({ totalCount, originalCount }: { totalCount: number; originalCount: number }) {
  return (
    <div className="flex justify-between items-end border-slate-700 pt-6 border-t">
      <div>
        <h2 className="font-bold text-2xl tracking-wide">Detailed Stock Table</h2>
        <p className="text-slate-400 text-sm">
          Real-time calculated stock levels for all items
        </p>
      </div>
      <div className="bg-slate-800/50 px-4 py-2 border border-slate-700 rounded font-mono text-xs">
        Total Items: <span className="text-retro-cyan">{totalCount}</span>
        {totalCount !== originalCount && (
          <span className="ml-2 text-slate-500">
            (filtered from {originalCount})
          </span>
        )}
      </div>
    </div>
  );
}