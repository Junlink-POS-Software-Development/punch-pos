"use client";

import React, { useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import { StockData } from "./lib/stocks.api";
import { useStocks } from "../../hooks/useStocks";
import { AlertCircle, Clock, ShieldCheck, Package } from "lucide-react";

export function ExpiryMonitor() {
  const { stocks, isLoading } = useStocks();

  const expiryGroups = useMemo(() => {
    const activeBatches = stocks.filter(
      (s) => s.flow === "stock-in" && (s.batch_remaining ?? 0) > 0 && s.expiry_date
    );

    const expired: StockData[] = [];
    const expiringSoon: StockData[] = []; // <= 30 days
    const safe: StockData[] = []; // > 30 days

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    activeBatches.forEach((batch) => {
      if (!batch.expiry_date) return;
      
      const expiryDate = new Date(batch.expiry_date);
      const diffDays = differenceInDays(expiryDate, today);

      if (diffDays < 0) {
        expired.push(batch);
      } else if (diffDays <= 30) {
        expiringSoon.push(batch);
      } else {
        safe.push(batch);
      }
    });

    // Sort by expiry date ASC
    const sortByDate = (a: StockData, b: StockData) => 
      new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime();

    return {
      expired: expired.sort(sortByDate),
      expiringSoon: expiringSoon.sort(sortByDate),
      safe: safe.sort(sortByDate),
    };
  }, [stocks]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 animate-pulse text-muted-foreground">
        Loading Expiry Monitor...
      </div>
    );
  }

  const { expired, expiringSoon, safe } = expiryGroups;

  const BatchCard = ({ batch, urgency }: { batch: StockData; urgency: "critical" | "warning" | "safe" }) => {
    const config = {
      critical: { bg: "bg-red-500/10", border: "border-red-500/20", icon: <AlertCircle className="w-4 h-4 text-red-500" /> },
      warning: { bg: "bg-orange-500/10", border: "border-orange-500/20", icon: <Clock className="w-4 h-4 text-orange-500" /> },
      safe: { bg: "bg-green-500/10", border: "border-green-500/20", icon: <ShieldCheck className="w-4 h-4 text-green-500" /> },
    };
    const c = config[urgency];
    
    return (
      <div className={`flex justify-between items-center p-3 rounded-lg border ${c.bg} ${c.border}`}>
        <div className="flex gap-3 items-center">
          {c.icon}
          <div>
            <h4 className="text-sm font-semibold">{batch.item_name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Package className="w-3 h-3" />
                {batch.batch_remaining} remaining
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {format(new Date(batch.expiry_date!), "MMM d, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            Stocked: {format(new Date(batch.time_stamp), "MMM d, yyyy")}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Expired Section */}
      {expired.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-red-500 flex items-center gap-2 border-b border-red-500/20 pb-2">
            <AlertCircle className="w-4 h-4" /> Expired Items ({expired.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expired.map(batch => <BatchCard key={batch.id} batch={batch} urgency="critical" />)}
          </div>
        </div>
      )}

      {/* Expiring Soon Section */}
      {expiringSoon.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-orange-500 flex items-center gap-2 border-b border-orange-500/20 pb-2">
            <Clock className="w-4 h-4" /> Expiring Soon - Next 30 Days ({expiringSoon.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringSoon.map(batch => <BatchCard key={batch.id} batch={batch} urgency="warning" />)}
          </div>
        </div>
      )}

      {/* Safe Section */}
      {safe.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-green-500 flex items-center gap-2 border-b border-green-500/20 pb-2">
            <ShieldCheck className="w-4 h-4" /> Safe - Over 30 Days ({safe.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {safe.map(batch => <BatchCard key={batch.id} batch={batch} urgency="safe" />)}
          </div>
        </div>
      )}

      {stocks.length > 0 && expired.length === 0 && expiringSoon.length === 0 && safe.length === 0 && (
        <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
          No expiry dates tracked for active batches.
        </div>
      )}
    </div>
  );
}
