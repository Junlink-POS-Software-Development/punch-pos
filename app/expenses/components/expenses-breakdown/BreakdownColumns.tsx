"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BreakdownRow } from "../../hooks/useExpensesBreakdown";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    val
  );

export const breakdownColumns: ColumnDef<BreakdownRow>[] = [
  {
    accessorKey: "classification",
    header: "Classification",
    cell: (info) => (
      <span className="font-medium text-slate-300">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: (info) => (
      <div className="font-mono text-emerald-400 text-right">
        {formatCurrency(info.getValue<number>())}
      </div>
    ),
  },
];
