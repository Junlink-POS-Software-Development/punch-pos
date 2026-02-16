"use client";

import { PackageCheck, AlertTriangle, Clock } from "lucide-react";
import type { InventoryStatsData } from "../../lib/dashboardMockData";

interface InventoryAlertsProps {
  inventoryStats: InventoryStatsData;
}

export function InventoryAlerts({ inventoryStats }: InventoryAlertsProps) {
  // Safe default
  const { lowStock = [], mostStocked, expiringSoon = [] } =
    inventoryStats || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      {/* 1. Low Stock Alert */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-red-500/10 text-red-500 rounded-md">
            <AlertTriangle size={16} />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Low Stock Alert
          </h3>
        </div>
        <div className="space-y-2 flex-grow">
          {lowStock.length > 0 ? (
            lowStock.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center text-sm p-2 bg-red-500/5 rounded border border-red-500/10"
              >
                <span className="text-foreground truncate pr-2">
                  {item.name}
                </span>
                <span className="font-bold text-red-500 shrink-0">
                  {item.qty} left
                </span>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              All stocks are healthy
            </div>
          )}
        </div>
      </div>

      {/* 2. Most Stocked Items */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md">
            <PackageCheck size={16} />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Top Inventory
          </h3>
        </div>
        <div className="space-y-2 flex-grow">
          {mostStocked ? (
            <div className="flex flex-col h-full justify-center pb-2">
              <span className="text-sm text-foreground font-medium">
                {mostStocked.name}
              </span>
              <span className="text-xl font-bold text-emerald-500">
                {mostStocked.qty} units
              </span>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              No inventory data
            </div>
          )}
        </div>
      </div>

      {/* 3. Expiring Soon */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-md">
            <Clock size={16} />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Expiring Soon
          </h3>
        </div>
        <div className="space-y-2 flex-grow">
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
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              No expiring items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
