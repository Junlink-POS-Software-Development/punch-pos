import React, { useRef } from "react";
import { Loader2 } from "lucide-react";
import "react-data-grid/lib/styles.css";
import { DataGrid, DataGridHandle } from "react-data-grid";
import { InventoryItem } from "../lib/inventory.api";

interface StocksDataGridProps {
  inventory: InventoryItem[];
  columns: any[]; // Using any[] for columns from react-data-grid
  isFetchingNextPage: boolean;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  isLoading: boolean;
  isError: boolean;
}

export function StocksDataGrid({
  inventory,
  columns,
  isFetchingNextPage,
  onScroll,
  isLoading,
  isError,
}: StocksDataGridProps) {
  const gridRef = useRef<DataGridHandle>(null);

  if (isLoading && inventory.length === 0) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
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
      className="border border-slate-700 rounded-lg overflow-hidden glass-effect relative"
      onScrollCapture={onScroll}
    >
      <DataGrid
        ref={gridRef}
        columns={columns}
        rows={inventory}
        rowKeyGetter={(row) => row.item_id}
        className="border-none h-[600px] rdg-dark"
        style={{
          height: "75vh",
          // @ts-ignore - CSS variables in style
          "--rdg-header-background-color": "#0a192f",
          "--rdg-row-hover-background-color": "rgba(30, 41, 59, 0.5)",
        }}
        rowClass={() => "hover:bg-slate-800/30 transition-colors"}
        onScroll={onScroll}
      />

      {isFetchingNextPage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 px-4 py-2 rounded-full flex items-center gap-2 border border-slate-700 shadow-xl z-10">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-xs text-blue-100">Loading more...</span>
        </div>
      )}
    </div>
  );
}
