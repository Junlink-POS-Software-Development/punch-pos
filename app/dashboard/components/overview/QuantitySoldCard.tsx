"use client";
import React, { useMemo } from "react";
import { useQuantitySoldMetrics } from "../../hooks/useQuantitySoldMetrics";
import { DragHandleProps } from "./DashboardGrid";
import { Loader2 } from "lucide-react";

interface QuantitySoldCardProps {
  dragHandleProps?: DragHandleProps;
}

const QuantitySoldCard = ({ dragHandleProps }: QuantitySoldCardProps) => {
  const { data: metrics, isLoading, error } = useQuantitySoldMetrics();

  const totalQuantity = useMemo(() => {
    if (!metrics) return 0;
    return metrics.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-card shadow-lg border border-border rounded-xl h-full min-h-[200px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex justify-center items-center bg-card shadow-lg border border-border rounded-xl h-full min-h-[200px] text-red-400">
        Error loading data
      </div>
    );
  }

  return (
    <div className="bg-card shadow-lg border border-border rounded-xl h-full overflow-hidden text-foreground">
      {/* Draggable Header */}
      <div
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
        className="hover:bg-muted/50 p-6 pb-2 transition-colors cursor-grab active:cursor-grabbing"
      >
        <h2 className="font-bold text-xl">Quantity Sold</h2>
      </div>

      <div className="p-6 pt-2">
        <div className="mb-6">
          <p className="text-muted-foreground text-sm">Total Items Sold</p>
          <p className="font-bold text-emerald-400 text-3xl">
            {totalQuantity.toLocaleString()}
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-lg">By Category</h3>
          <div className="space-y-3">
            {metrics.map((entry) => (
              <div
                key={entry.category}
                className="flex justify-between items-center pb-2 border-border last:border-0 border-b"
              >
                <span className="text-muted-foreground">{entry.category}</span>
                <span className="font-medium">
                  {entry.quantity.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantitySoldCard;
