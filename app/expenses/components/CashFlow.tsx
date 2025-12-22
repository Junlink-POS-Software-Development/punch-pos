"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  fetchFlowCategories,
  fetchCashFlowLedger,
  DateRange,
  CashFlowEntry,
} from "../lib/cashflow.api";
import { Filter, Calendar, Loader2, Download } from "lucide-react";
import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css"; // Essential for the grid to render correctly

export function CashFlow() {
  // --- State Management ---

  // We track the user's manual selection. If empty, we derive the default below.
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Default to current month
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split("T")[0],
      end: lastDay.toISOString().split("T")[0],
    };
  });

  // --- 1. Fetch Categories ---
  const { data: categories = [] } = useSWR(
    "flow-categories",
    fetchFlowCategories
  );

  // --- Derived State (THE FIX) ---
  // Instead of using useEffect to sync state, we calculate the active category during render.
  // If the user hasn't selected one, we default to the first available category.
  const activeCategory =
    selectedCategory || (categories.length > 0 ? categories[0] : "");

  // --- 2. Fetch Ledger Data ---
  // We use 'activeCategory' here instead of the raw state
  const { data: ledger = [], isLoading } = useSWR(
    activeCategory ? ["cash-flow-ledger", activeCategory, dateRange] : null,
    ([, category, range]) => fetchCashFlowLedger(category, range)
  );

  // --- 3. Grid Configuration ---
  const headerClass =
    "bg-slate-900/80 text-slate-400 font-semibold uppercase text-xs flex items-center pl-4";
  const cellClass = "text-slate-300 text-sm flex items-center pl-4 h-full";

  const columns: Column<CashFlowEntry>[] = [
    {
      key: "date",
      name: "Date",
      headerCellClass: headerClass,
      cellClass: cellClass,
      width: 150,
      renderCell: ({ row }) => (
        <span>
          {new Date(row.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "forwarded",
      name: "Forwarded",
      headerCellClass: headerClass,
      cellClass: `${cellClass} font-mono text-slate-400 justify-end pr-6`,
      width: 150,
      renderCell: ({ row }) => (
        <span>
          ₱
          {row.forwarded.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "cash_in",
      name: "Cash In",
      headerCellClass: headerClass,
      cellClass: `${cellClass} font-mono text-green-400 justify-end pr-6`,
      width: 150,
      renderCell: ({ row }) => (
        <span>
          {row.cash_in > 0
            ? `+₱${row.cash_in.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}`
            : "-"}
        </span>
      ),
    },
    {
      key: "cash_out",
      name: "Cash Out",
      headerCellClass: headerClass,
      cellClass: `${cellClass} font-mono text-red-400 justify-end pr-6`,
      width: 150,
      renderCell: ({ row }) => (
        <span>
          {row.cash_out > 0
            ? `-₱${row.cash_out.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}`
            : "-"}
        </span>
      ),
    },
    {
      key: "balance",
      name: "Balance",
      headerCellClass: headerClass,
      cellClass: `${cellClass} font-mono font-bold text-white bg-slate-800/30 justify-end pr-6`,
      width: 180,
      renderCell: ({ row }) => (
        <span>
          ₱{row.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* --- Controls Header --- */}
      <div className="flex md:flex-row flex-col justify-between items-end md:items-center gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-xl glass-effect">
        {/* Left: Filters */}
        <div className="flex md:flex-row flex-col gap-4 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 font-medium text-slate-400 text-xs uppercase tracking-wider">
              <Filter className="w-3 h-3" /> Category
            </label>
            <select
              value={activeCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block bg-slate-800 p-2.5 border border-slate-700 focus:border-blue-500 rounded-lg focus:ring-blue-500 w-full md:w-48 text-white text-sm"
            >
              {categories.length === 0 && <option>Loading...</option>}
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 font-medium text-slate-400 text-xs uppercase tracking-wider">
              <Calendar className="w-3 h-3" /> Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="bg-slate-800 p-2.5 border border-slate-700 focus:border-blue-500 rounded-lg focus:ring-blue-500 text-white text-sm"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="bg-slate-800 p-2.5 border border-slate-700 focus:border-blue-500 rounded-lg focus:ring-blue-500 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 border border-slate-700 rounded-lg font-medium text-slate-300 text-sm transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* --- Data Grid --- */}
      <div className="relative border border-slate-800 rounded-xl h-[600px] overflow-hidden glass-effect">
        {isLoading ? (
          <div className="z-10 absolute inset-0 flex justify-center items-center gap-2 bg-slate-900/50 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading ledger data...</span>
          </div>
        ) : ledger.length === 0 ? (
          <div className="z-10 absolute inset-0 flex justify-center items-center text-slate-500 italic">
            No transactions found for this period.
          </div>
        ) : null}

        <DataGrid
          columns={columns}
          rows={ledger}
          rowKeyGetter={(row) => `${row.date}-${row.category}`}
          className="border-none h-full rdg-dark"
          rowClass={() => "hover:bg-slate-800/30 transition-colors"}
        />
      </div>
    </div>
  );
}
