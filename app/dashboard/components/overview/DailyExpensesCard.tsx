"use client";
import React from "react";
import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";
import { DragHandleProps } from "./DashboardGrid";
import { Loader2 } from "lucide-react";

interface Props {
  dragHandleProps?: DragHandleProps;
}

const DailyExpensesCard = ({ dragHandleProps }: Props) => {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

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

  const { totalExpenses, cashFlow } = metrics;

  return (
    <div className="bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full overflow-hidden text-white">
      <div
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
        className="hover:bg-slate-700/30 p-6 pb-2 transition-colors cursor-grab active:cursor-grabbing"
      >
        <h2 className="font-bold text-xl">Daily Expenses</h2>
      </div>

      <div className="p-6 pt-2">
        <div className="mb-6">
          <p className="text-slate-400 text-sm">Total Expenses</p>
          <p className="font-bold text-rose-400 text-3xl">
            ₱
            {totalExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="space-y-3">
          {cashFlow.map((entry) => (
            <div
              key={entry.category}
              className="flex justify-between items-center pb-2 border-slate-700 last:border-0 border-b"
            >
              <span className="text-slate-300">{entry.category}</span>
              <span className="font-medium text-rose-100">
                ₱
                {entry.cash_out.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyExpensesCard;
