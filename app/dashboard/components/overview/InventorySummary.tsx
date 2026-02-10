"use client";

import React from "react";
import { useLowStockInfinite, useMostStockedInfinite } from "../../hooks/useInventory";
import { AlertTriangle, PackageCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { InventoryItem } from "@/app/inventory/components/stocks-monitor/lib/inventory.api";

interface InventorySummaryProps {
  showNavigation?: boolean;
}

export const InventorySummary: React.FC<InventorySummaryProps> = ({
  showNavigation = true,
}) => {
  const { 
    data: lowStockData, 
    fetchNextPage: fetchNextLow, 
    hasNextPage: hasNextLow,
    isFetchingNextPage: isFetchingLow,
    isLoading: isLoadingLow 
  } = useLowStockInfinite();

  const { 
    data: mostStockedData, 
    fetchNextPage: fetchNextMost, 
    hasNextPage: hasNextMost,
    isFetchingNextPage: isFetchingMost,
    isLoading: isLoadingMost
  } = useMostStockedInfinite();

  const handleLowStockScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 20 && hasNextLow && !isFetchingLow) {
      fetchNextLow();
    }
  };

  const handleMostStockedScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 20 && hasNextMost && !isFetchingMost) {
      fetchNextMost();
    }
  };

  const lowStockItems = lowStockData?.pages.flatMap(p => p.data) || [];
  const mostStockedItems = mostStockedData?.pages.flatMap(p => p.data) || [];

  if (isLoadingLow || isLoadingMost) {
     return (
       <div className="gap-6 grid grid-cols-1 md:grid-cols-2 animate-pulse">
         <div className="bg-card/50 border border-border rounded-xl h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
         </div>
         <div className="bg-card/50 border border-border rounded-xl h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
         </div>
       </div>
     );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-foreground text-xl">Inventory Highlights</h2>
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        {/* Low Stock Section */}
        <div className="bg-card backdrop-blur-sm border border-red-500/20 rounded-xl overflow-hidden flex flex-col h-80">
          <div className="flex justify-between items-center bg-red-500/5 p-4 border-red-500/20 border-b shrink-0">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold">Low Stock Alert</h3>
            </div>
            {showNavigation && (
              <Link
                href="/inventory?view=monitor"
                className="flex items-center gap-1 text-red-400/70 hover:text-red-300 text-xs transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
          <div 
            className="p-2 overflow-y-auto custom-scrollbar flex-1 relative"
            onScroll={handleLowStockScroll}
          >
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-muted-foreground text-sm text-center">
                No items below threshold.
              </div>
            ) : (
              <div className="space-y-1">
                {lowStockItems.map((item: InventoryItem) => (
                  <div
                    key={item.item_id}
                    className="group flex justify-between items-center hover:bg-red-500/5 p-3 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground group-hover:text-red-300 truncate transition-colors">
                        {item.item_name}
                      </p>
                      <p className="text-muted-foreground text-xs truncate">
                        SKU: {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center bg-red-500/10 px-2.5 py-0.5 border border-red-500/20 rounded-full font-medium text-red-400 text-xs">
                        {item.current_stock} left
                      </span>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Threshold: {item.low_stock_threshold ?? 5}
                      </p>
                    </div>
                  </div>
                ))}
                {isFetchingLow && (
                  <div className="p-2 flex justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Most Stocked Section */}
        <div className="bg-card backdrop-blur-sm border border-emerald-500/20 rounded-xl overflow-hidden flex flex-col h-80">
          <div className="flex justify-between items-center bg-emerald-500/5 p-4 border-emerald-500/20 border-b shrink-0">
            <div className="flex items-center gap-2 text-emerald-400">
              <PackageCheck className="w-5 h-5" />
              <h3 className="font-semibold">Most Stocked</h3>
            </div>
            {showNavigation && (
              <Link
                href="/inventory?view=monitor"
                className="flex items-center gap-1 text-emerald-400/70 hover:text-emerald-300 text-xs transition-colors"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
          <div 
             className="p-2 overflow-y-auto custom-scrollbar flex-1 relative"
             onScroll={handleMostStockedScroll}
          >
            {mostStockedItems.length === 0 ? (
              <div className="p-8 text-muted-foreground text-sm text-center">
                No inventory data available.
              </div>
            ) : (
              <div className="space-y-1">
                {mostStockedItems.map((item: InventoryItem) => (
                  <div
                    key={item.item_id}
                    className="group flex justify-between items-center hover:bg-emerald-500/5 p-3 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground group-hover:text-emerald-300 truncate transition-colors">
                        {item.item_name}
                      </p>
                      <p className="text-muted-foreground text-xs truncate">
                        SKU: {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded-full font-medium text-emerald-400 text-xs">
                        {item.current_stock} units
                      </span>
                    </div>
                  </div>
                ))}
                {isFetchingMost && (
                   <div className="p-2 flex justify-center">
                     <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
