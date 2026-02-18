"use client";

import { Calendar, Filter, Download, Clock, RefreshCcw } from "lucide-react";

interface DashboardHeaderProps {
  storeName: string;
  today: string;
  time: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  isHistoricalView: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  storeName,
  today,
  time,
  selectedDate,
  onDateChange,
  isHistoricalView,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          Overview
          {isHistoricalView && (
            <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
              History Mode
            </span>
          )}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Live Time Display */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-card border border-input rounded-lg text-sm font-mono text-muted-foreground shadow-sm">
          <Clock size={16} />
          <span>{time}</span>
        </div>

        {/* Date Filter */}
        <div className="relative group">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="pl-3 pr-3 py-2 bg-card border border-input rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-sm transition-all hover:border-muted-foreground/50"
          />
        </div>

        {/* Refresh Button */}
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 bg-card border border-input rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          title="Refresh Dashboard"
        >
          <RefreshCcw size={18} className={isRefreshing ? "animate-spin text-primary" : ""} />
        </button>

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
