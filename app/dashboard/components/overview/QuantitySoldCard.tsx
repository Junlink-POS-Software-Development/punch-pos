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
      <div className="flex justify-center items-center bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full min-h-[200px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex justify-center items-center bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full min-h-[200px] text-red-400">
        Error loading data
      </div>
    );
  }

  return (
    <div className="bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full overflow-hidden text-white">
      {/* Draggable Header */}
      <div
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
        className="hover:bg-slate-700/30 p-6 pb-2 transition-colors cursor-grab active:cursor-grabbing"
      >
        <h2 className="font-bold text-xl">Quantity Sold</h2>
      </div>

      <div className="p-6 pt-2">
        <div className="mb-6">
          <p className="text-slate-400 text-sm">Total Items Sold</p>
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
                className="flex justify-between items-center pb-2 border-slate-700 last:border-0 border-b"
              >
                <span className="text-slate-300">{entry.category}</span>
                <span className="font-medium text-emerald-100">
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
