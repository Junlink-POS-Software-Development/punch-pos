"use client";

import { useState, useRef } from "react";
import { PackageCheck, AlertTriangle, Clock } from "lucide-react";
import type { InventoryStatsData } from "../../lib/dashboardMockData";
import { useInventoryMonitor } from "../../hooks/useInventoryMonitor";

interface InventoryAlertsProps {
  inventoryStats: InventoryStatsData;
}

export function InventoryAlerts({ inventoryStats }: InventoryAlertsProps) {
  const [lowStockLimit, setLowStockLimit] = useState<number | "all">(5);
  const { lowStockQuery, topInventoryQuery } = useInventoryMonitor();

  // Safe default for expiring soon from mock/static data
  const { expiringSoon = [] } = inventoryStats || {};

  // Live Low Stock
  const allLowStock = lowStockQuery.data?.pages.flat() || [];
  const lowStock = lowStockLimit === "all" ? allLowStock : allLowStock.slice(0, lowStockLimit);
  const { 
    hasNextPage: hasNextLowStock, 
    fetchNextPage: fetchNextLowStock, 
    isFetchingNextPage: isFetchingMoreLowStock, 
    isLoading: isLoadingLowStock 
  } = lowStockQuery;

  // Live Top Inventory
  const topInventory = topInventoryQuery.data?.pages.flat() || [];
  const { hasNextPage, fetchNextPage, isFetchingNextPage, isLoading: isLoadingTop } = topInventoryQuery;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lowStockScrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 20 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleLowStockScroll = () => {
    if (!lowStockScrollRef.current || lowStockLimit !== "all") return;
    const { scrollTop, scrollHeight, clientHeight } = lowStockScrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 20 && hasNextLowStock && !isFetchingMoreLowStock) {
      fetchNextLowStock();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      {/* 1. Low Stock Alert */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col h-[300px]">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/10 text-red-500 rounded-md">
              <AlertTriangle size={16} />
            </div>
            <h3 className="font-semibold text-sm text-foreground">
              Low Stock Alert
            </h3>
          </div>
          <select 
            value={lowStockLimit} 
            onChange={(e) => {
              const val = e.target.value;
              setLowStockLimit(val === "all" ? "all" : Number(val));
            }}
            className="text-xs bg-muted border border-border rounded px-2 py-1 text-foreground"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
            <option value="all">Show All</option>
          </select>
        </div>
        <div 
          ref={lowStockScrollRef}
          onScroll={handleLowStockScroll}
          className="space-y-2 grow overflow-y-auto pr-2 custom-scrollbar"
        >
          {isLoadingLowStock ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
              Loading...
            </div>
          ) : lowStock.length > 0 ? (
            <>
              {lowStock.map((item, idx) => (
                <div
                  key={`${item.item_id}-${idx}`}
                  className="flex justify-between items-center text-sm p-2 bg-red-500/5 rounded border border-red-500/10"
                >
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="text-foreground truncate text-sm">
                      {item.item_name}
                    </span>
                    {item.sku && <span className="text-[10px] text-muted-foreground">{item.sku}</span>}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-bold text-red-500 text-sm">
                      {item.current_stock} left
                    </span>
                    <span className="text-[10px] text-muted-foreground mr-1">
                      Threshold: {item.low_stock_threshold}
                    </span>
                  </div>
                </div>
              ))}
              {isFetchingMoreLowStock && (
                <div className="text-center py-2 text-xs text-muted-foreground animate-pulse mt-2">
                  Loading more...
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              All stocks are healthy
            </div>
          )}
        </div>
      </div>

      {/* 2. Most Stocked Items */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col h-[300px]">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md">
            <PackageCheck size={16} />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Top Inventory
          </h3>
        </div>
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="space-y-2 grow overflow-y-auto pr-2 custom-scrollbar"
        >
          {isLoadingTop ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
              Loading...
            </div>
          ) : topInventory.length > 0 ? (
            <>
              {topInventory.map((item, idx) => (
                <div
                  key={`${item.item_id}-${idx}`}
                  className="flex justify-between items-center text-sm p-2 bg-emerald-500/5 rounded border border-emerald-500/10"
                >
                  <div className="flex flex-col overflow-hidden pr-2">
                    <span className="text-foreground truncate text-sm">
                      {item.item_name}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-500 shrink-0 text-sm">
                    {item.current_stock} units
                  </span>
                </div>
              ))}
              {isFetchingNextPage && (
                <div className="text-center py-2 text-xs text-muted-foreground animate-pulse mt-2">
                  Loading more...
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              No inventory data
            </div>
          )}
        </div>
      </div>

      {/* 3. Expiring Soon */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col h-[300px]">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-md">
            <Clock size={16} />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Expiring Soon
          </h3>
        </div>
        <div className="space-y-2 grow overflow-y-auto pr-2 custom-scrollbar">
          {expiringSoon.length > 0 ? (
            expiringSoon.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm p-2 bg-amber-500/5 rounded border border-amber-500/10"
              >
                <span className="text-foreground truncate pr-2">
                  {item.name}
                </span>
                <span className="font-bold text-amber-500 shrink-0">
                  {item.expires}
                </span>
              </div>
            ))
          ) : (
             <div className="h-full min-h-[150px] flex items-center justify-center text-xs text-muted-foreground italic">
              No expiring items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
