"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import { breakdownColumns } from "./BreakdownColumns";
import { BreakdownRow } from "../../hooks/useExpensesBreakdown";

interface Props {
  sourceName: string;
  data: BreakdownRow[];
  total: number;
}

export const SourceBreakdownTable = ({ sourceName, data, total }: Props) => {
  const table = useReactTable({
    data,
    columns: breakdownColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col bg-slate-900/50 border border-slate-700 rounded-lg h-full overflow-hidden">
      <div className="flex justify-between items-center bg-slate-800/80 p-4 border-slate-700 border-b">
        <h3 className="font-bold text-emerald-100">{sourceName}</h3>
        <span className="text-slate-400 text-xs">
          Total:{" "}
          <span className="font-mono text-emerald-400 text-sm">
            {new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
            }).format(total)}
          </span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-semibold">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-800/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={2} className="p-4 text-slate-500 text-center">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
