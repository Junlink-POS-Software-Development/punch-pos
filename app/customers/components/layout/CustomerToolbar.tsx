"use client";

import React from "react";
import { Search, Filter, Settings2 } from "lucide-react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { useCustomerData } from "../../hooks/useCustomerData";

/**
 * ─── Customer Toolbar ────────────────────────────────────────────────────────
 * Search bar, group filter dropdown, and manage groups button.
 */
export function CustomerToolbar() {
  const { searchTerm, setSearchTerm, selectedGroupId, setSelectedGroupId, setManageGroupsOpen } =
    useCustomerStore();
  const { groups } = useCustomerData();

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
