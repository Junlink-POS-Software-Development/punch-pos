"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { ExpenseData } from "../../lib/expenses.api";
import { DateColumnFilter } from "./components/DateColumnFilter";

interface CashoutTableProps {
  expenses: ExpenseData[];
  isLoading: boolean;
  dateRange: { start: string; end: string };
  onDateChange: (start: string, end: string) => void;
}

const columnHelper = createColumnHelper<ExpenseData>();

export const CashoutTable = ({
  expenses,
  isLoading,
  dateRange,
  onDateChange,
}: CashoutTableProps) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("transaction_date", {
        header: () => (
          <DateColumnFilter
            startDate={dateRange.start}
            endDate={dateRange.end}
            onDateChange={onDateChange}
          />
        ),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("source", {
        header: "Source",
        cell: (info) => (
          <span className="font-medium text-cyan-400">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("classification", {
        header: "Classification",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("receipt_no", {
        header: "Receipt",
        cell: (info) => (
          <span className="text-slate-400">{info.getValue() || "-"}</span>
        ),
      }),
      columnHelper.accessor("amount", {
        header: () => <div className="text-right">Amount</div>,
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="font-mono font-medium text-emerald-400 text-right">
              ₱
              {val.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      }),
      columnHelper.accessor("notes", {
        header: "Notes",
        cell: (info) => (
          <span className="block max-w-[200px] text-slate-500 text-sm truncate italic">
            {info.getValue()}
          </span>
        ),
      }),
    ],
    [dateRange, onDateChange]
  );

  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    // 1. Fixed height container with flex layout
    <div className="flex flex-col border border-slate-700/50 rounded-lg h-[80vh] overflow-hidden glass-effect">
      {/* 2. Scrollable area for the table */}
      <div className="relative flex-1 overflow-auto">
        <table className="relative w-full text-sm text-left border-collapse">
          {/* 3. Sticky Header */}
          <thead className="top-0 z-20 sticky bg-slate-900 shadow-md border-slate-700 border-b font-semibold text-slate-300 text-xs uppercase tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="bg-slate-900 px-4 py-3">
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
                  className="hover:bg-slate-800/80 border-slate-800 border-b last:border-b-0 transition-colors"
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
                  No expenses found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
