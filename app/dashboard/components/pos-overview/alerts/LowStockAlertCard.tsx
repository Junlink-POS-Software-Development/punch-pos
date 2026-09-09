"use client";

import { useState, useRef } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { StandardSelect } from "@/components/reusables/StandardSelect";
import { AlertListSkeleton } from "./AlertListSkeleton";

interface LowStockAlertCardProps {
  query: any; // Result from useInfiniteQuery
}

export function LowStockAlertCard({ query }: LowStockAlertCardProps) {
  const [lowStockLimit, setLowStockLimit] = useState<number | "all">(5);
  const { 
    data, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = query;

  const allLowStock = data?.pages.flat() || [];
  const lowStock = lowStockLimit === "all" ? allLowStock : allLowStock.slice(0, lowStockLimit);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current || lowStockLimit !== "all") return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 20 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
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
        <StandardSelect
          value={lowStockLimit}
          onChange={(e) => {
            const val = e.target.value;
            setLowStockLimit(val === "all" ? "all" : Number(val));
          }}
          className="text-[10px] py-1 px-2 h-8 min-w-[80px]"
          containerClassName="mb-0"
        >
          <option value={5} className="bg-background">Top 5</option>
          <option value={10} className="bg-background">Top 10</option>
          <option value={15} className="bg-background">Top 15</option>
          <option value={20} className="bg-background">Top 20</option>
          <option value="all" className="bg-background">Show All</option>
        </StandardSelect>
      </div>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="space-y-2 grow overflow-y-auto pr-2 custom-scrollbar"
      >
        {isLoading ? (
          <AlertListSkeleton rows={4} />
        ) : lowStock.length > 0 ? (
          <>
            {lowStock.map((item: any, idx: number) => (
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
            {isFetchingNextPage && (
              <div className="flex justify-between items-center p-2 rounded bg-muted/20 border border-border/40 animate-pulse mt-1">
                <div className="flex flex-col gap-1 flex-1 pr-2">
                  <div className="h-3 w-28 bg-muted rounded" />
                  <div className="h-2 w-16 bg-muted/60 rounded" />
                </div>
                <div className="h-4 w-12 bg-muted/70 rounded-md" />
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
  );
}
