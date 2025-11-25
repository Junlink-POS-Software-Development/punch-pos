import React from "react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}) => {
  return (
    <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs uppercase font-semibold">
          Date Range:
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        />
        <span className="text-slate-500">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-300 ml-2"
        >
          Clear
        </button>
      )}
    </div>
  );
};
