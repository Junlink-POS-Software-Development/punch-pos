import { Table, flexRender } from "@tanstack/react-table";
import { Loader2, Cloud } from "lucide-react";
import { OptimisticExpenseData } from "./types";
import { useRef, useEffect, useCallback } from "react";

interface CashoutTableBodyProps {
  table: Table<OptimisticExpenseData>;
  isLoading: boolean;
  columnsCount: number;
  editingId: string | null;
  // Infinite scroll props
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export const CashoutTableBody = ({
  table,
  isLoading,
  columnsCount,
  editingId,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: CashoutTableBodyProps) => {
  // IntersectionObserver for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  return (
    <div className="relative flex-1 overflow-auto">
      <table className="relative w-full text-sm text-left border-collapse">
        {/* Sticky Header */}
        <thead className="top-0 z-20 sticky bg-slate-900 shadow-md border-slate-700 border-b font-semibold text-slate-300 text-xs uppercase tracking-wider">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="bg-slate-900 px-4 py-3">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="bg-slate-900/50 text-slate-200">
          {isLoading ? (
            <tr>
              <td colSpan={columnsCount} className="h-32 text-center">
                <Loader2 className="mx-auto w-6 h-6 text-emerald-500 animate-spin" />
              </td>
            </tr>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => {
              const isOptimistic = row.original._optimistic;
              const isSyncing = row.original._syncing;

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-800/80 border-slate-800 border-b last:border-b-0 transition-colors ${
                    row.original.id === editingId ? "bg-slate-800/50" : ""
                  } ${isOptimistic ? "opacity-80" : ""}`}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <td key={cell.id} className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Show syncing indicator on first cell only */}
                        {idx === 0 && isSyncing && (
                          <span className="flex items-center gap-1 text-xs text-blue-400" title="Syncing...">
                            <Cloud className="w-3 h-3 animate-pulse" />
                          </span>
                        )}
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columnsCount} className="h-24 text-slate-500 text-center">
                No expenses found for this period.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-sm p-4 flex justify-center items-center z-50 border-t border-slate-700">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading more records...</span>
          </div>
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div
        ref={observerTarget}
        className="h-20 w-full bg-transparent absolute bottom-0 pointer-events-none"
      />
    </div>
  );
};
