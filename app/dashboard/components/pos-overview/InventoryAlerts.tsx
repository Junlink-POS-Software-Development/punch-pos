"use client";

import { useInventoryMonitor } from "../../hooks/useInventoryMonitor";
import type { InventoryStatsData } from "../../lib/dashboardMockData";
import { LowStockAlertCard } from "./alerts/LowStockAlertCard";
import { TopInventoryCard } from "./alerts/TopInventoryCard";
import { ExpiringSoonCard } from "./alerts/ExpiringSoonCard";

interface InventoryAlertsProps {
  inventoryStats: InventoryStatsData;
}

export function InventoryAlerts({ inventoryStats }: InventoryAlertsProps) {
  const { lowStockQuery, topInventoryQuery, expiringSoonQuery } = useInventoryMonitor();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      <LowStockAlertCard query={lowStockQuery} />
      <TopInventoryCard query={topInventoryQuery} />
      <ExpiringSoonCard query={expiringSoonQuery} />
    </div>
  );
}
