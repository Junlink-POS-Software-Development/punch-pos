"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { fetchCashFlowByRange } from "../../lib/dashboard.api";
import { DragHandleProps } from "./DashboardGrid";
import { DateColumnFilter } from "@/app/expenses/components/cashout/components/DateColumnFilter";
import { useDashboardDateStore } from "../../store/useDashboardDateStore"; // Import the new store
interface MonthlyGrossProps {
  dragHandleProps?: DragHandleProps;
}

const MonthlyGrossCard = ({ dragHandleProps }: MonthlyGrossProps) => {
  // Access state and actions from the store
  const { startDate, endDate, setDateRange, hasHydrated } =
    useDashboardDateStore();

  const { data: grossAmount = 0, isLoading: loading } = useQuery({
    queryKey: ["monthly-gross", startDate, endDate],
    queryFn: async () => {
      const amount = await fetchCashFlowByRange(startDate, endDate);
      return Number(amount);
    },
    enabled: hasHydrated && !!startDate && !!endDate,
  });

  const totalGross = grossAmount;

  return (
    <div className="relative flex flex-col bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full text-white">
      <div
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
        className="flex justify-between items-center hover:bg-slate-700/30 p-6 pb-2 rounded-t-xl transition-colors cursor-grab active:cursor-grabbing"
      >
        <h2 className="font-bold text-xl">Monthly Income Gross</h2>

        {/* stopPropagation prevents dragging when interacting with the filter */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Use the store action directly */}
          <DateColumnFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={setDateRange}
          />
        </div>
      </div>

      <div className="p-6 pt-2">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-sm">
            <span>Selected Range:</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-200 text-xs">
              {/* Ensure we display something safe during hydration or loading */}
              {hasHydrated && startDate && endDate
                ? `${dayjs(startDate).format("MMM D")} - ${dayjs(
                    endDate
                  ).format("MMM D, YYYY")}`
                : "Loading Range..."}
            </span>
          </div>

          {/* Show loading state if we are fetching OR still hydrating the store */}
          {loading || !hasHydrated ? (
            <div className="bg-slate-700 mt-2 rounded w-32 h-10 animate-pulse" />
          ) : (
            <p className="font-bold text-emerald-400 text-3xl">
              ₱
              {totalGross.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
        <p className="mt-4 text-slate-500 text-xs italic">
          Sum of all cash-in categories for the specified date range.
        </p>
      </div>
    </div>
  );
};

export default MonthlyGrossCard;
