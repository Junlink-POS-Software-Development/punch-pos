import React from "react";
import { Row, flexRender } from "@tanstack/react-table";
import { Customer } from "../../lib/types";

// ─── Memoized Table Row ─────────────────────────────────────────────────────

interface CustomerTableRowProps {
  row: Row<Customer>;
  onRowClick: (customerId: string) => void;
  showTopSpendersOnly?: boolean;
  absoluteIndex: number;
}

export const CustomerTableRow = React.memo(({
  row,
  onRowClick,
  showTopSpendersOnly,
  absoluteIndex,
}: CustomerTableRowProps) => {
  return (
    <tr
      onClick={() => onRowClick(row.original.id)}
      className={`hover:bg-accent/40 cursor-pointer transition-colors group ${
        row.getIsSelected() ? "bg-primary/5" : ""
      }`}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="px-4 py-1.5 align-middle relative"
        >
          {flexRender(cell.column.columnDef.cell, { ...cell.getContext(), absoluteIndex, showTopSpendersOnly })}
        </td>
      ))}
    </tr>
  );
});

CustomerTableRow.displayName = "CustomerTableRow";
