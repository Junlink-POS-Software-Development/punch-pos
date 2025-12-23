"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { fetchCashFlowByRange } from "../lib/dashboard.api";
import { DragHandleProps } from "./DashboardGrid";
import { DateColumnFilter } from "@/app/expenses/components/cashout/components/DateColumnFilter";

interface MonthlyGrossProps {
  dragHandleProps?: DragHandleProps;
}

const MonthlyGrossCard = ({ dragHandleProps }: MonthlyGrossProps) => {
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [loading, setLoading] = useState(true);
  const [totalGross, setTotalGross] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const grossAmount = await fetchCashFlowByRange(startDate, endDate);
        setTotalGross(Number(grossAmount));
      } catch (error) {
        console.error("Failed to fetch monthly gross", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    // FIX 1: Removed 'overflow-hidden' and added 'relative'
    // This allows the absolute dropdown to render outside the card boundary
    <div className="relative flex flex-col bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full text-white">
      <div
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
        // FIX 2: Added 'rounded-t-xl' to maintain the top corner radius on hover
        className="flex justify-between items-center hover:bg-slate-700/30 p-6 pb-2 rounded-t-xl transition-colors cursor-grab active:cursor-grabbing"
      >
        <h2 className="font-bold text-xl">Monthly Income Gross</h2>

        {/* stopPropagation prevents dragging when interacting with the filter */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <DateColumnFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
        </div>
      </div>

      <div className="p-6 pt-2">
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-sm">
            <span>Selected Range:</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-200 text-xs">
              {startDate && endDate
                ? `${dayjs(startDate).format("MMM D")} - ${dayjs(
                    endDate
                  ).format("MMM D, YYYY")}`
                : "All Time"}
            </span>
          </div>

          {loading ? (
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
