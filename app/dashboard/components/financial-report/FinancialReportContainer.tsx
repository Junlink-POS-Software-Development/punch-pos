"use client";

import dayjs from "dayjs";

import { DateColumnFilter } from "@/app/expenses/components/cashout/components/DateColumnFilter";
import { useFinancialReport } from "../../hooks/useFinancialReport";
import { FinancialReportTable } from "./FinancialReportTable";
import { useDashboardDateStore } from "../../store/useDashboardDateStore";

export const FinancialReportContainer = () => {
  const { startDate, endDate, setDateRange } = useDashboardDateStore();
  const { data, isLoading } = useFinancialReport(startDate, endDate);

  return (
    <div className="space-y-6 bg-slate-900 shadow-lg p-6 border border-slate-800 rounded-xl text-white">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="font-bold text-emerald-400 text-2xl">
          Financial Report
        </h2>

        <div className="flex items-center gap-4">
          <DateColumnFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={setDateRange}
            align="end" // <--- This prevents it from going off-screen
          />
        </div>
      </div>

      <FinancialReportTable data={data} isLoading={isLoading} />

      <div className="flex sm:flex-row flex-col justify-center gap-2 sm:gap-6 mt-2 text-slate-500 text-xs text-center">
        <span>
          Forwarded = Balance before {dayjs(startDate).format("MMM D")}
        </span>
        <span className="font-mono text-emerald-500/80">
          (Total Forwarded + Total Gross) - Total Expenses = Total Cash on Hand
        </span>
      </div>
    </div>
  );
};
