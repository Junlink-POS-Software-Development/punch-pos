"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";

import { Filter, Loader2, Download } from "lucide-react";
import {
  fetchCashFlowLedger,
  fetchFlowCategories,
} from "@/app/expenses/lib/cashflow.api";
import { CashFlowEntry } from "../../lib/types";

interface CashFlowProps {
  startDate: string;
  endDate: string;
}

export function CashFlow({ startDate, endDate }: CashFlowProps) {
  // --- State Management ---
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // --- 1. Fetch Categories ---
  const { data: categories = [] } = useQuery({
    queryKey: ["flow-categories"],
    queryFn: fetchFlowCategories,
  });

  // --- Derived State ---
  // Default to "Overall" or the first available category if nothing is selected
  const activeCategory =
    selectedCategory || (categories.length > 0 ? categories[0] : "Overall");

  // Construct the range object expected by the API
  const dateRangeParam = useMemo(
    () => ({ start: startDate, end: endDate }),
    [startDate, endDate]
  );

  // --- 2. Fetch Ledger Data ---
  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ["cash-flow-ledger", activeCategory, dateRangeParam],
    queryFn: () => fetchCashFlowLedger(activeCategory, dateRangeParam),
    enabled: !!activeCategory,
  });

  // --- 3. Table Column Definitions ---
  const columns = useMemo<ColumnDef<CashFlowEntry>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date", // Simple header, filter is now handled globally
        cell: (info) => (
          <span>
            {new Date(info.getValue() as string).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
      {
        accessorKey: "forwarded",
        header: "Forwarded",
        cell: (info) => (
          <div className="font-mono text-slate-400 text-right">
            ₱
            {(info.getValue() as number).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>
        ),
      },
      {
        accessorKey: "cash_in",
        header: "Cash In",
        cell: (info) => {
          const val = info.getValue() as number;
          return (
            <div className="font-mono text-green-400 text-right">
              {val > 0
                ? `+₱${val.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}`
                : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "cash_out",
        header: "Cash Out",
        cell: (info) => {
          const val = info.getValue() as number;
          return (
            <div className="font-mono text-red-400 text-right">
              {val > 0
                ? `-₱${val.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}`
                : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: (info) => (
          <div className="bg-slate-800/50 py-1 rounded font-mono font-bold text-white text-right">
            ₱
            {(info.getValue() as number).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </div>
        ),
      },
    ],
    [] // No dependencies needed here anymore
  );

  // --- 4. Table Instance ---
  const table = useReactTable({
    data: ledger,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 border border-slate-700 rounded-lg font-medium text-slate-300 text-sm transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="border border-slate-800 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Header */}
            <thead className="bg-slate-900">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-slate-700 border-b-2"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-sm uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Body */}
            <tbody className="bg-slate-900/50 text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center">
                    <Loader2 className="mx-auto w-6 h-6 text-emerald-500 animate-spin" />
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/80 border-slate-800 border-b transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-slate-500 text-center"
                  >
                    No transactions found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
