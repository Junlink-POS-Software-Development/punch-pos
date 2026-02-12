"use client";

import { Calendar, Filter, Download } from "lucide-react";

interface DashboardHeaderProps {
  storeName: string;
  today: string;
  time: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  isHistoricalView: boolean;
}

export function DashboardHeader({
  storeName,
  today,
  time,
  selectedDate,
  onDateChange,
  isHistoricalView,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          {storeName} Dashboard
          {isHistoricalView && (
            <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
              History Mode
            </span>
          )}
        </h1>
        <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
          <span>{today}</span>
          <span className="w-1 h-1 rounded-full bg-slate-400"></span>
          <span className="font-mono">{time}</span>
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={16} className="text-muted-foreground" />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-9 pr-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-sm transition-all hover:border-muted-foreground/50"
          />
        </div>
        <button className="p-2 bg-card border border-input rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm">
          <Filter size={18} />
        </button>
        <button className="p-2 bg-card border border-input rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
}
