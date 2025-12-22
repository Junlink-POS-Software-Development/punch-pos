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

interface CashoutTableProps {
  expenses: ExpenseData[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<ExpenseData>();

export const CashoutTable = ({ expenses, isLoading }: CashoutTableProps) => {
  // --- Column Definitions ---
  const columns = useMemo(
    () => [
      columnHelper.accessor("transaction_date", {
        header: "Date",
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
          const val = Number(info.getValue());
          return (
            <div className="text-red-400 text-right">
              -₱
              {val.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      }),
    ],
    []
  );

  // --- Table Instance ---
  const table = useReactTable({
    data: expenses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border border-slate-800 rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead className="bg-slate-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-slate-700 border-b-2">
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
                  No expenses recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
