"use client";

import React from "react";
import { useInventoryMonitor } from "@/app/dashboard/hooks/useInventoryMonitor";
import { LowStockAlertCard } from "@/app/dashboard/components/pos-overview/alerts/LowStockAlertCard";
import { TopInventoryCard } from "@/app/dashboard/components/pos-overview/alerts/TopInventoryCard";
import { ExpiringSoonCard } from "@/app/dashboard/components/pos-overview/alerts/ExpiringSoonCard";

interface InventorySummaryProps {
  showNavigation?: boolean; // Prop expected by StocksMonitor, though currently unused in this simplified version
}

export function InventorySummary({ showNavigation = true }: InventorySummaryProps) {
  const { lowStockQuery, topInventoryQuery, expiringSoonQuery } = useInventoryMonitor();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <LowStockAlertCard query={lowStockQuery} />
      <TopInventoryCard query={topInventoryQuery} />
      <ExpiringSoonCard query={expiringSoonQuery} />
    </div>
  );
}
