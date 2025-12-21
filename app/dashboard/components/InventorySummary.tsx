"use client";

import React, { useState, useMemo } from "react";
import { useInventory } from "../hooks/useInventory";
import { AlertTriangle, PackageCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export const InventorySummary = () => {
  const { inventory, isLoading } = useInventory();
  const [limit, setLimit] = useState<number>(5);

  const { lowStockItems, mostStockedItems } = useMemo(() => {
    if (!inventory) return { lowStockItems: [], mostStockedItems: [] };

    const lowStock = inventory
      .filter((item) => {
        const threshold = item.low_stock_threshold ?? 5;
        return item.current_stock <= threshold;
      })
      .sort((a, b) => a.current_stock - b.current_stock); // Lowest stock first

    const mostStocked = [...inventory]
      .sort((a, b) => b.current_stock - a.current_stock) // Highest stock first
      .slice(0, limit);

    return {
      lowStockItems: lowStock.slice(0, limit),
      mostStockedItems: mostStocked,
    };
  }, [inventory, limit]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
        <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Inventory Highlights</h2>
        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
          <span className="text-xs text-slate-400 px-2">Show:</span>
          {[5, 10, 20].map((val) => (
            <button
              key={val}
              onClick={() => setLimit(val)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                limit === val
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Section */}
        <div className="bg-slate-900/50 border border-red-500/20 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-red-500/20 bg-red-500/5 flex justify-between items-center">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-semibold">Low Stock Alert</h3>
            </div>
            <Link 
              href="/inventory?view=monitor" 
              className="text-xs text-red-400/70 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-2">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No items below threshold.
              </div>
            ) : (
              <div className="space-y-1">
                {lowStockItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="flex justify-between items-center p-3 hover:bg-red-500/5 rounded-lg transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 truncate group-hover:text-red-200 transition-colors">
                        {item.item_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        SKU: {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        {item.current_stock} left
                      </span>
                      <p className="text-[10px] text-slate-600 mt-1">
                        Threshold: {item.low_stock_threshold ?? 5}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Most Stocked Section */}
        <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-emerald-500/20 bg-emerald-500/5 flex justify-between items-center">
            <div className="flex items-center gap-2 text-emerald-400">
              <PackageCheck className="w-5 h-5" />
              <h3 className="font-semibold">Most Stocked</h3>
            </div>
            <Link 
              href="/inventory?view=monitor" 
              className="text-xs text-emerald-400/70 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-2">
            {mostStockedItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No inventory data available.
              </div>
            ) : (
              <div className="space-y-1">
                {mostStockedItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="flex justify-between items-center p-3 hover:bg-emerald-500/5 rounded-lg transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 truncate group-hover:text-emerald-200 transition-colors">
                        {item.item_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        SKU: {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.current_stock} units
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
