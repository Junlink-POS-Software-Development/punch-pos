"use client";

import { useState, useMemo } from "react";
import { SourceBreakdownTable } from "./SourceBreakdownTable";
import { BreakdownChart } from "./BreakdownChart";
import { DateColumnFilter } from "@/app/expenses/components/cashout/components/DateColumnFilter";
import { Loader2, Filter } from "lucide-react";
import { useExpensesBreakdown } from "../../hooks/useExpensesBreakdown";
import { useDashboardDateStore } from "@/app/dashboard/store/useDashboardDateStore";

export const ExpensesBreakdown = () => {
  // 1. Use shared date store for uniform date values across components
  const { startDate, endDate, setDateRange } = useDashboardDateStore();

  // 2. We only store the user's *intent* to select a specific source.
  const [selectedSourceId, setSelectedSourceId] = useState<string>("");

  const handleDateChange = (start: string, end: string) => {
    setDateRange(start, end);
  };

  const { data, loading } = useExpensesBreakdown(startDate, endDate);

  // 3. DERIVED STATE (The Fix):
  // Calculate which source to show during render.
  // If the user's selected ID exists in the new data, use it.
  // Otherwise, fallback to the first item (data[0]).
  const activeSourceData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Try to find the one the user selected previously
    const userSelection = data.find((d) => d.sourceName === selectedSourceId);

    // If found, return it. If not (or if selection is empty), default to the first one.
    return userSelection || data[0];
  }, [data, selectedSourceId]);

  return (
    <div className="space-y-6 animate-in duration-500 fade-in">
      {/* Header Section */}
      <div className="flex xl:flex-row flex-col justify-between items-start xl:items-center gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
        <div>
          <h2 className="font-bold text-emerald-400 text-xl">
            Expense Breakdown
          </h2>
          <p className="text-slate-400 text-sm">
            Analyze expenses by classification per source
          </p>
        </div>

        <div className="flex sm:flex-row flex-col items-stretch sm:items-center gap-4 w-full xl:w-auto">
          {/* SOURCE SELECTOR DROPDOWN */}
          {data && data.length > 0 && activeSourceData && (
            <div className="group relative">
              <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                <Filter className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <select
                // 4. Bind value to the *derived* active source
                value={activeSourceData.sourceName}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="bg-slate-800 hover:bg-slate-700/50 py-2 pr-8 pl-10 border border-slate-700 focus:border-emerald-500 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-64 text-white text-sm transition-colors appearance-none cursor-pointer"
              >
                {data.map((source) => (
                  <option key={source.sourceName} value={source.sourceName}>
                    {source.sourceName}
                  </option>
                ))}
              </select>
              <div className="right-0 absolute inset-y-0 flex items-center pr-3 text-slate-500 text-xs pointer-events-none">
                ▼
              </div>
            </div>
          )}

          {/* DATE FILTER */}
          <DateColumnFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            align="end"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center border border-slate-800 border-dashed rounded-xl w-full h-96 text-slate-400">
          <Loader2 className="mr-2 w-6 h-6 text-emerald-500 animate-spin" />
          Loading breakdown...
        </div>
      ) : !activeSourceData ? (
        <div className="bg-slate-900/20 p-12 border border-slate-800 border-dashed rounded-xl text-center">
          <p className="text-slate-500 text-lg">
            No expense data found for this period.
          </p>
          <p className="mt-1 text-slate-600 text-sm">
            Try selecting a different date range.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart Section */}
          <BreakdownChart
            data={activeSourceData.breakdown}
            sourceName={activeSourceData.sourceName}
          />

          {/* Table Section */}
          <div>
            <h3 className="mb-4 font-bold text-white text-lg">
              Detailed Report
            </h3>
            <div className="w-full">
              <SourceBreakdownTable
                sourceName={activeSourceData.sourceName}
                data={activeSourceData.breakdown}
                total={activeSourceData.total}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
