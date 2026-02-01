"use client";

import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import "react-data-grid/lib/styles.css";
import { DataGrid, DataGridHandle } from "react-data-grid";
import { useInventoryInfinite } from "../../../dashboard/hooks/useInventory";
import { InventorySummary } from "@/app/dashboard/components/overview/InventorySummary";
import { useStocksLogic } from "./hooks/useStocksLogic";
import { getStocksColumns } from "./components/Columns";

export default function StocksMonitor() {
  const gridRef = useRef<DataGridHandle>(null);
  
  // Custom hook handles filtering/sorting query params
  const { filters, sortState, handleApplyFilter, handleSort } = useStocksLogic();

  // Infinite Query Hook
  const { 
    inventory, 
    totalCount, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInventoryInfinite({
    filters,
    sort: sortState.col ? { col: sortState.col, dir: sortState.dir } : undefined,
  });

  // Handle Scroll to Load More
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    // Load more when scrolled to bottom (with some buffer)
    if (scrollHeight - scrollTop - clientHeight < 50 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const columns = getStocksColumns({
    inventory: inventory || [], // Pass current rows for context if needed
    filters,
    sortState,
    onApplyFilter: handleApplyFilter,
    onSort: handleSort,
  });

  if (isLoading && inventory.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-red-500">Error loading stocks data. Please try again.</div>;
  }

  return (
    <div className="flex flex-col gap-8 p-6 text-slate-200">
      <InventorySummary showNavigation={false} />

      <div className="flex flex-col gap-4">
        <HeaderSection
          totalCount={totalCount}
          currentCount={inventory.length}
        />

        <div 
          className="border border-slate-700 rounded-lg overflow-hidden glass-effect relative"
          onScrollCapture={handleScroll} // Capture scroll on the container wrapping grid if needed, or pass to grid if supported
        >
          {/* 
            DataGrid doesn't always expose a simple onScroll. 
            We usually wrap it or assume the Grid's internal scroll. 
            React-Data-Grid requires a specific onScroll prop or container handling.
            Let's try passing onScroll to the DataGrid's scrollable container via `className` or props if supported.
            Actually, RDG has `onScroll` prop.
          */}
          <DataGrid
            ref={gridRef}
            columns={columns}
            rows={inventory}
            rowKeyGetter={(row) => row.item_id}
            className="border-none h-[600px] rdg-dark"
            style={{ height: "75vh" }}
            rowClass={() => "hover:bg-slate-800/30 transition-colors"}
            onScroll={handleScroll} 
          />
          
          {isFetchingNextPage && (
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-full flex items-center gap-2 border border-slate-700 shadow-xl z-10">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-xs text-blue-100">Loading more...</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for the header section
function HeaderSection({
  totalCount,
  currentCount,
}: {
  totalCount: number;
  currentCount: number;
}) {
  return (
    <div className="flex justify-between items-end py-4 border-slate-700">
      <div>
        {/* Potentially Add Global Search here later */}
      </div>
      <div className="bg-slate-800/50 px-4 py-2 border border-slate-700 rounded font-mono text-xs">
        Showing <span className="text-blue-400">{currentCount}</span> of <span className="text-slate-400">{totalCount}</span> items
      </div>
    </div>
  );
}
