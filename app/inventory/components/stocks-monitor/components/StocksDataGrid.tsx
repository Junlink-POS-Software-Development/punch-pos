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
      className="border border-border rounded-lg overflow-hidden relative shadow-sm"
      onScrollCapture={onScroll}
    >
      <DataGrid
        ref={gridRef}
        columns={columns}
        rows={inventory}
        rowKeyGetter={(row) => row.item_id}
        className="border-none h-[600px] rdg-custom"
        style={{
          height: "75vh",
          // @ts-ignore - CSS variables in style
          "--rdg-header-background-color": "var(--color-muted)",
          "--rdg-row-hover-background-color": "var(--color-muted) / 0.5",
          "--rdg-color": "var(--color-foreground)",
          "--rdg-background-color": "var(--color-card)",
          "--rdg-border-color": "var(--color-border)",
        }}
        rowClass={() => "hover:bg-muted/30 transition-colors"}
        onScroll={onScroll}
      />

      {isFetchingNextPage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 px-4 py-2 rounded-full flex items-center gap-2 border border-border shadow-xl z-10">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-primary">Loading more...</span>
        </div>
      )}
    </div>
  );
}
