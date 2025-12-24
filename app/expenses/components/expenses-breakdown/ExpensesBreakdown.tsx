"use client";

import { useState } from "react";
import dayjs from "dayjs";

import { SourceBreakdownTable } from "./SourceBreakdownTable";
import { BreakdownChart } from "./BreakdownChart";
import { DateColumnFilter } from "@/app/expenses/components/cashout/components/DateColumnFilter";
import { Loader2 } from "lucide-react";
import { useExpensesBreakdown } from "../../hooks/useExpensesBreakdown";

export const ExpensesBreakdown = () => {
  // 1. Initialize local state with Today's date
  const today = dayjs().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // 2. Handler for the filter
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const { data, loading } = useExpensesBreakdown(startDate, endDate);

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      {/* Header Section */}
      <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
        <div>
          <h2 className="font-bold text-emerald-400 text-xl">
            Expense Breakdown
          </h2>
          <p className="text-slate-400 text-sm">
            Visualizing expenses by source and classification
          </p>
        </div>

        {/* Date Filter Component - Connected to local state */}
        <div className="flex items-center gap-2">
          <DateColumnFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            align="end"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center border border-slate-800 border-dashed rounded-xl w-full h-64 text-slate-400">
          <Loader2 className="mr-2 w-6 h-6 text-emerald-500 animate-spin" />
          Loading breakdown...
        </div>
      ) : !data || data.length === 0 ? (
        <div className="bg-slate-900/20 p-12 border border-slate-800 border-dashed rounded-xl text-center">
          <p className="text-slate-500 text-lg">
            No expense data found for this period.
          </p>
          <p className="mt-1 text-slate-600 text-sm">
            Try selecting a different date range.
          </p>
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <BreakdownChart data={data} />

          {/* Tables Section */}
          <div>
            <h3 className="flex items-center gap-2 mb-4 font-bold text-white text-lg">
              Detailed Breakdown
              <span className="bg-slate-800 px-2 py-0.5 rounded-full font-normal text-slate-500 text-xs">
                {data.length} Sources
              </span>
            </h3>
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {data.map((source) => (
                <SourceBreakdownTable
                  key={source.sourceName}
                  sourceName={source.sourceName}
                  data={source.breakdown}
                  total={source.total}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
