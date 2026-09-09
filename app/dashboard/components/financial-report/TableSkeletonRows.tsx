"use client";

import React from "react";

interface TableSkeletonRowsProps {
  columnsCount: number;
  rowsCount?: number;
}

export function TableSkeletonRows({
  columnsCount,
  rowsCount = 5,
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-border/40">
          {Array.from({ length: columnsCount }).map((_, colIdx) => (
            <td key={colIdx} className="py-3 px-4">
              <div
                className="h-4 bg-muted/60 rounded animate-pulse"
                style={{
                  width:
                    colIdx === 0
                      ? `${65 + (rowIdx % 3) * 10}%`
                      : colIdx === columnsCount - 1
                      ? "80px"
                      : `${50 + ((rowIdx + colIdx) % 4) * 12}%`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
