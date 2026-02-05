"use client";

import React, { memo } from "react";
import { InventorySummary } from "@/app/dashboard/components/overview/InventorySummary";
import { StocksMonitorContent } from "./components/StocksMonitorContent";

const MemoizedInventorySummary = memo(InventorySummary);

export default function StocksMonitor() {
  return (
    <div className="flex flex-col gap-8 p-6 text-foreground">
      {/* 
        Memoize Summary to prevent re-renders when browsing the list. 
        Actually InventorySummary fetches its own data so it might not re-render deeply, 
        but memo prevents the VDOM diffing overhead if props haven't changed.
      */}
      <MemoizedInventorySummary showNavigation={false} />

      <StocksMonitorContent />
    </div>
  );
}

