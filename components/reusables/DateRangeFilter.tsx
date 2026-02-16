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
    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs uppercase font-semibold">
          Date Range:
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-card border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <span className="text-muted-foreground/50">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-card border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
