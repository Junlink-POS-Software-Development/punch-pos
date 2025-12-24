import React, { useState, useRef, useEffect } from "react";
import { Calendar, CalendarDays, X } from "lucide-react";

interface DateColumnFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  align?: "center" | "start" | "end"; // <--- Add this optional prop
}

export const DateColumnFilter = ({
  startDate,
  endDate,
  onDateChange,
  align = "start", // <--- Set a default (usually "start" or "center")
}: DateColumnFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onDateChange(formatDate(start), formatDate(end));
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onDateChange(formatDate(start), formatDate(end));
    setIsOpen(false);
  };

  const handleClear = () => {
    onDateChange("", ""); // Clear filter to show all
    setIsOpen(false);
  };

  return (
    <div className="inline-block relative" ref={containerRef}>
      {/* Header Trigger */}
      <div
        onClick={(e) => {
          e.stopPropagation(); // Prevent sorting if sorting is enabled
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-slate-800 ${
          isOpen || (startDate && endDate)
            ? "text-emerald-400"
            : "text-slate-300"
        }`}
      >
        <span>Date</span>
        <CalendarDays className="w-4 h-4" />
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className={`top-full z-50 absolute flex flex-col gap-4 bg-slate-900/95 shadow-2xl backdrop-blur-md mt-2 p-4 border border-slate-700 rounded-xl w-72 ${
          align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
        }`}>
          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-slate-700 border-b">
            <span className="font-semibold text-slate-200 text-sm">
              Filter Date Range
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Date Inputs */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-10 text-slate-400 text-xs">Start</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onDateChange(e.target.value, endDate)}
                  className="bg-slate-800 px-2 py-1.5 border border-slate-700 focus:border-emerald-500 rounded outline-none w-full text-slate-200 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-10 text-slate-400 text-xs">End</span>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onDateChange(startDate, e.target.value)}
                  className="bg-slate-800 px-2 py-1.5 border border-slate-700 focus:border-emerald-500 rounded outline-none w-full text-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="gap-2 grid grid-cols-2 pt-2 border-slate-700 border-t">
            <button
              onClick={() => handlePreset(0)}
              className="bg-slate-800 hover:bg-emerald-900/30 px-3 py-2 border border-slate-700 rounded font-medium text-slate-300 hover:text-emerald-400 text-xs transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handlePreset(7)}
              className="bg-slate-800 hover:bg-emerald-900/30 px-3 py-2 border border-slate-700 rounded font-medium text-slate-300 hover:text-emerald-400 text-xs transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={handleThisMonth}
              className="col-span-2 bg-slate-800 hover:bg-emerald-900/30 px-3 py-2 border border-slate-700 rounded font-medium text-slate-300 hover:text-emerald-400 text-xs transition-colors"
            >
              This Month
            </button>
            <button
              onClick={handleClear}
              className="col-span-2 bg-slate-800 hover:bg-red-900/30 mt-1 px-3 py-2 border border-slate-700 rounded font-medium text-slate-400 hover:text-red-400 text-xs transition-colors"
            >
              Show All History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
