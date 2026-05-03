"use client";

import React, { memo, useState } from "react";
import { InventorySummary } from "./InventorySummary";
import { StocksMonitorContent } from "./components/StocksMonitorContent";

const MemoizedInventorySummary = memo(InventorySummary);

export function StocksMonitor() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  return (
    <div className="flex flex-col p-6 text-foreground h-[calc(100vh-100px)]">
      <div className={`shrink-0 transition-all duration-500 ease-in-out will-change-[max-height,opacity,transform,margin] overflow-hidden ${
        isHeaderCollapsed 
          ? "max-h-0 opacity-0 mb-0 scale-95 pointer-events-none" 
          : "max-h-[1000px] md:max-h-[600px] lg:max-h-[400px] opacity-100 mb-8 scale-100"
      }`}>
        <MemoizedInventorySummary showNavigation={false} />
      </div>

      <StocksMonitorContent onCollapseChange={setIsHeaderCollapsed} isHeaderCollapsed={isHeaderCollapsed} />
    </div>
  );
}

