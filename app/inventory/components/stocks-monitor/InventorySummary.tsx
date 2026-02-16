"use client";

import React from "react";
import { PackageX, PackageCheck } from "lucide-react";
import { useLowStockInfinite, useMostStockedInfinite } from "@/app/dashboard/hooks/useInventory";

interface InventorySummaryProps {
  showNavigation?: boolean; // Prop expected by StocksMonitor, though currently unused in this simplified version
}

export function InventorySummary({ showNavigation = true }: InventorySummaryProps) {
  const { 
    data: lowStockData, 
    isLoading: isLoadingLow 
  } = useLowStockInfinite();

  const { 
    data: mostStockedData, 
    isLoading: isLoadingMost 
  } = useMostStockedInfinite();

  // Combine pages
  const lowStockItems = lowStockData?.pages.flatMap(p => p.data) || [];
  const mostStockedItems = mostStockedData?.pages.flatMap(p => p.data) || [];
  
  // Get top item for "Most Stocked" card
  const topStocked = mostStockedItems.length > 0 ? mostStockedItems[0] : null;

  if (isLoadingLow || isLoadingMost) {
    return <div className="p-4 text-center text-slate-500">Loading inventory summary...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Low Stock */}
      <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm flex items-start gap-3">
        <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
          <PackageX size={20} />
        </div>
        <div className="w-full">
          <h4 className="text-xs font-bold text-red-800 uppercase mb-2">
            Low Stock Alert
          </h4>
          <div className="space-y-2">
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item.item_id} className="flex justify-between text-sm">
                <span className="text-slate-700 truncate pr-2">
                  {item.item_name}
                </span>
                <span className="font-bold text-red-600">
                  {item.current_stock} left
                </span>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <p className="text-xs text-slate-400 italic">No low stock items.</p>
            )}
          </div>
        </div>
      </div>

      {/* Most Stocked */}
      <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-start gap-3">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
          <PackageCheck size={20} />
        </div>
        <div className="w-full">
          <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">
            Most Stocked Item
          </h4>
          <div className="flex flex-col h-full justify-center pb-2">
            {topStocked ? (
              <>
                <span className="text-sm text-slate-700 font-medium">
                  {topStocked.item_name}
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  {topStocked.current_stock} units
                </span>
              </>
            ) : (
                <p className="text-xs text-slate-400 italic">No inventory data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
