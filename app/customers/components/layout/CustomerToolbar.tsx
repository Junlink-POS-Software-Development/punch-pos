"use client";

import React from "react";
import { Search, Filter, Settings2, Trophy, Loader2 } from "lucide-react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { useCustomerData } from "../../hooks/useCustomerData";

/**
 * ─── Customer Toolbar ────────────────────────────────────────────────────────
 * Search bar, group filter dropdown, and manage groups button.
 */
export function CustomerToolbar() {
  const searchTerm = useCustomerStore((s) => s.searchTerm);
  const setSearchTerm = useCustomerStore((s) => s.setSearchTerm);
  const selectedGroupId = useCustomerStore((s) => s.selectedGroupId);
  const setSelectedGroupId = useCustomerStore((s) => s.setSelectedGroupId);
  const setManageGroupsOpen = useCustomerStore((s) => s.setManageGroupsOpen);
  const showTopSpendersOnly = useCustomerStore((s) => s.showTopSpendersOnly);
  const setShowTopSpendersOnly = useCustomerStore((s) => s.setShowTopSpendersOnly);
  const { groups, isFetching } = useCustomerData();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      {/* Search */}
      <div className="relative w-full sm:w-80 group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </span>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers by name, email, or phone..."
          className="w-full bg-card border border-border text-foreground rounded-xl py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-ring focus:border-primary outline-none text-sm transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Filter Groupings Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 bg-card border border-border hover:bg-accent px-4 py-2.5 rounded-xl text-sm font-medium text-foreground transition-all"
          >
            <Filter size={16} className="text-muted-foreground" />
            <span className="hidden sm:inline">Filter Groupings</span>
            <span className="sm:hidden">Filter</span>
          </button>

          {/* Dropdown uses a native select layered on top for simplicity and accessibility */}
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Filter by group"
          >
            <option value="all">All Groups</option>
            <option value="ungrouped">Ungrouped</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Top Spenders Toggle */}
        <button
          onClick={() => setShowTopSpendersOnly(!showTopSpendersOnly)}
          disabled={isFetching}
          className={`flex items-center gap-2 border px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showTopSpendersOnly
              ? "bg-amber-500/10 border-amber-500/50 text-amber-600 shadow-sm shadow-amber-500/10"
              : "bg-card border-border hover:bg-accent text-foreground"
          } ${isFetching ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-500/20"}`}
        >
          {isFetching ? (
            <Loader2 size={16} className="text-amber-500 animate-spin" />
          ) : (
            <Trophy size={16} className={showTopSpendersOnly ? "text-amber-500" : "text-muted-foreground"} />
          )}
          <span className="hidden sm:inline">Top Spenders</span>
          <span className="sm:hidden">Top</span>
        </button>

        {/* Manage Groupings Button */}
        <button
          onClick={() => setManageGroupsOpen(true)}
          className="flex items-center gap-2 bg-card border border-border hover:bg-accent px-4 py-2.5 rounded-xl text-sm font-medium text-foreground transition-all"
        >
          <Settings2 size={16} className="text-muted-foreground" />
          <span className="hidden sm:inline">Manage Groupings</span>
          <span className="sm:hidden">Manage</span>
        </button>
      </div>
    </div>
  );
}
