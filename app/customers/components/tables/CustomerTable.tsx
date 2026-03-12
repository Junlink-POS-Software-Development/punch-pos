import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useCustomerData } from "../../hooks/useCustomerData";
import { useCustomerTableActions } from "../../hooks/useCustomerTableActions";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useCustomerStore } from "../../store/useCustomerStore";
import { getCustomerColumns } from "./columns/customerColumns";
import { CustomerTableRow } from "./CustomerTableRow";
import { CustomerBulkActionBar } from "./CustomerBulkActionBar";

// ─── Customer Table (Orchestrator) ──────────────────────────────────────────

export const CustomerTable = () => {
  const { customers, groups, isLoading, isFetching } = useCustomerData();
  const actions = useCustomerTableActions();
  const isHeaderCollapsed = useCustomerStore((s) => s.isHeaderCollapsed);
  const setHeaderCollapsed = useCustomerStore((s) => s.setHeaderCollapsed);
  const showTopSpendersOnly = useCustomerStore((s) => s.showTopSpendersOnly);

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const lastScrollY = useRef(0);
  const frameId = useRef<number | null>(null);

  // ─── Scroll-based header collapse ───────────────────────────────────────
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const delta = currentScrollY - lastScrollY.current;

    if (frameId.current) cancelAnimationFrame(frameId.current);

    frameId.current = requestAnimationFrame(() => {
      if (currentScrollY > 100 && delta > 30) {
        if (!isHeaderCollapsed) setHeaderCollapsed(true);
      } else if (currentScrollY < 100 || delta < -30) {
        if (isHeaderCollapsed) setHeaderCollapsed(false);
      }
      lastScrollY.current = currentScrollY;
    });
  };

  useEffect(() => {
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, []);

  // ─── Sorting ────────────────────────────────────────────────────────────
  const isSortedByLastName = useMemo(() => {
    return sorting.some(s => s.id === 'name');
  }, [sorting]);

  useEffect(() => {
    if (showTopSpendersOnly) {
      setSorting([{ id: "spent", desc: true }]);
    } else {
      setSorting([]);
    }
  }, [showTopSpendersOnly]);

  // ─── Columns ────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => getCustomerColumns({ groups, isSortedByLastName, actions }),
    [groups, isSortedByLastName, actions]
  );

  // ─── Table Instance ─────────────────────────────────────────────────────
  const table = useReactTable({
    data: customers,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    meta: { showTopSpendersOnly },
  });

  // ─── Infinite Scroll ───────────────────────────────────────────────────
  const allRows = table.getRowModel().rows;
  const { visibleCount, loadMoreRef } = useInfiniteScroll({
    totalItems: allRows.length,
  });

  const pagedRows = useMemo(() => {
    return allRows.slice(0, visibleCount);
  }, [allRows, visibleCount]);

  // ─── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return <div className="text-muted-foreground text-center mt-20">Loading...</div>;
  }

  const selectedCount = Object.keys(rowSelection).length;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden flex flex-col h-full">
      <CustomerBulkActionBar
        selectedCount={selectedCount}
        groups={groups}
        onBulkMove={(groupId) => actions.handleBulkMove(table, groupId)}
      />

      <div
        onScroll={handleScroll}
        className="flex-1 overflow-auto w-full custom-scrollbar relative"
      >
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="bg-card border border-border px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Refreshing Data...</span>
            </div>
          </div>
        )}
        <table className="w-full text-left min-w-[1100px] border-collapse translate-z-0">
          <thead className="bg-muted/30 text-muted-foreground text-[10px] font-bold uppercase sticky top-0 z-10 backdrop-blur-md border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/30 will-change-transform translate-z-0">
            {pagedRows.map((row, idx) => (
              <CustomerTableRow
                key={row.id}
                row={row}
                onRowClick={actions.handleViewCustomer}
                showTopSpendersOnly={showTopSpendersOnly}
                absoluteIndex={idx}
              />
            ))}
          </tbody>
        </table>
        {visibleCount < allRows.length && (
          <div
            ref={loadMoreRef}
            className="py-4 text-center text-xs text-muted-foreground font-bold animate-pulse"
          >
            Loading more records...
          </div>
        )}
      </div>
    </div>
  );
};