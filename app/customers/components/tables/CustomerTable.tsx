import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import {
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Lock,
  Unlock,
  ArrowUpDown,
  User,
} from "lucide-react";
import { useCustomerData, useCustomerMutations } from "../../hooks/useCustomerData";
import { useCustomerStore } from "../../store/useCustomerStore";
import {
  updateCustomerGroup,
  deleteCustomer,
  bulkUpdateCustomerGroup,
  toggleCustomerLock,
} from "../../api/services";
import { StandardSelect } from "@/components/reusables/StandardSelect";

import { Customer } from "../../lib/types";

// Helper function to parse name parts from a full name
const parseNameParts = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: "", lastName: "" };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: "", lastName: parts[1] };
  }
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleName = parts.slice(1, -1).join(" ");
  return { firstName, middleName, lastName };
};

const formatDisplayName = (fullName: string, sortByLastName: boolean): string => {
  if (!sortByLastName) return fullName;
  const { firstName, middleName, lastName } = parseNameParts(fullName);
  if (!lastName) return fullName;
  const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : "";
  return `${lastName}, ${firstName}${middleInitial}`;
};

const getLastName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
};

const columnHelper = createColumnHelper<Customer>();

export const CustomerTable = () => {
  const { customers, groups, isLoading } = useCustomerData();
  const { refreshData } = useCustomerMutations();
  const { setViewMode, setSelectedCustomerId, isHeaderCollapsed, setHeaderCollapsed } = useCustomerStore();

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const frameId = useRef<number | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const delta = currentScrollY - lastScrollY.current;

    // Throttle updates using requestAnimationFrame
    if (frameId.current) cancelAnimationFrame(frameId.current);
    
    frameId.current = requestAnimationFrame(() => {
      // Significant scroll down
      if (currentScrollY > 100 && delta > 30) {
        if (!isHeaderCollapsed) setHeaderCollapsed(true);
      } 
      // Scroll up or at top
      else if (currentScrollY < 100 || delta < -30) {
        if (isHeaderCollapsed) setHeaderCollapsed(false);
      }
      lastScrollY.current = currentScrollY;
    });
  };

  // Cleanup frame on unmount
  useEffect(() => {
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, []);

  // Sync sorting with the "Sort by Last Name" preference if needed, 
  // but TanStack handles sorting state natively now.
  const isSortedByLastName = useMemo(() => {
    return sorting.some(s => s.id === 'name');
  }, [sorting]);

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <button
          onClick={table.getToggleAllRowsSelectedHandler()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {table.getIsAllRowsSelected() ? (
            <CheckSquare size={14} className="text-primary" />
          ) : (
            <Square size={14} />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <button
          onClick={row.getToggleSelectedHandler()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {row.getIsSelected() ? (
            <CheckSquare size={14} className="text-primary" />
          ) : (
            <Square size={14} />
          )}
        </button>
      ),
      size: 40,
    }),
    columnHelper.accessor("full_name", {
      id: "name",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          Name
          <ArrowUpDown
            size={12}
            className={column.getIsSorted() ? "text-primary" : "opacity-30"}
          />
        </button>
      ),
      cell: ({ row, getValue }) => {
        const c = row.original;
        const isLocked = c.document_metadata?.isLocked || false;
        return (
          <button
            onClick={() => {
              setSelectedCustomerId(c.id);
              setViewMode("detail");
            }}
            className="flex items-center gap-2 text-left hover:text-primary transition-colors pr-4"
          >
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-black shrink-0 relative">
              {(getValue() || "?").charAt(0).toUpperCase()}
              {isLocked && (
                <Lock
                  size={8}
                  className="absolute -top-0.5 -right-0.5 text-yellow-500 bg-background rounded-full"
                />
              )}
            </div>
            <span className="text-sm font-semibold truncate max-w-[140px]">
              {formatDisplayName(getValue() || "Unknown", isSortedByLastName)}
            </span>
          </button>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = getLastName(rowA.original.full_name || "");
        const b = getLastName(rowB.original.full_name || "");
        return a.localeCompare(b);
      },
    }),
    columnHelper.accessor("phone_number", {
      id: "contact",
      header: "Contact",
      cell: (info) => (
        <span className="text-xs text-muted-foreground font-medium">
          {info.getValue() || "-"}
        </span>
      ),
    }),
    columnHelper.accessor("total_spent", {
      id: "spent",
      header: "Spent",
      cell: (info) => (
        <span className="text-xs font-bold text-foreground">
          ₱{(info.getValue() || 0).toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor("visit_count", {
      id: "orders",
      header: "Orders",
      cell: (info) => (
        <span className="text-xs font-medium text-muted-foreground">
          {info.getValue() || 0}
        </span>
      ),
    }),
    columnHelper.accessor("last_visit_at", {
      id: "lastVisit",
      header: "Last Visit",
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className="text-[10px] text-muted-foreground/80 font-medium">
            {val ? new Date(val).toLocaleDateString() : "-"}
          </span>
        );
      },
    }),
    columnHelper.accessor("group_id", {
      id: "membership",
      header: "Membership",
      cell: ({ row, getValue }) => {
        const c = row.original;
        const isLocked = c.document_metadata?.isLocked || false;
        return (
          <div className="pr-2">
            <StandardSelect
              value={getValue() || "ungrouped"}
              onChange={async (e) => {
                if (isLocked) {
                  alert("This customer is locked and cannot be moved.");
                  return;
                }
                if (!confirm("Are you sure you want to move this customer?")) return;
                await updateCustomerGroup(c.id, e.target.value);
                refreshData();
              }}
              className="py-0.5 px-2 h-7 text-[10px] font-bold"
            >
              <option value="ungrouped" className="bg-background">
                Ungrouped
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-background">
                  {g.name}
                </option>
              ))}
            </StandardSelect>
          </div>
        );
      },
    }),
    columnHelper.accessor("date_of_registration", {
      id: "joined",
      header: "Joined",
      cell: (info) => {
        const val = info.getValue();
        return (
          <span className="text-[10px] text-muted-foreground/80 font-medium">
            {val ? new Date(val).toLocaleDateString() : "-"}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const c = row.original;
        const isLocked = c.document_metadata?.isLocked || false;
        return (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const newLockStatus = !isLocked;
                await toggleCustomerLock(c.id, newLockStatus, c.document_metadata || {});
                refreshData();
              }}
              className={`p-1 rounded hover:bg-muted ${
                isLocked ? "text-yellow-500" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <button
              onClick={() => {
                setSelectedCustomerId(c.id);
                setViewMode("detail");
              }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (isLocked) {
                  alert("This customer is locked and cannot be deleted.");
                  return;
                }
                if (!confirm("Are you sure you want to delete?")) return;
                await deleteCustomer(c.id);
                refreshData();
              }}
              className={`p-1 rounded hover:bg-muted text-muted-foreground hover:text-red-500 ${
                isLocked ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    }),
  ], [groups, isSortedByLastName, setSelectedCustomerId, setViewMode, refreshData]);

  const table = useReactTable({
    data: customers,
    columns,
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const allRows = table.getRowModel().rows;
  const pagedRows = useMemo(() => {
    return allRows.slice(0, visibleCount);
  }, [allRows, visibleCount]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < allRows.length) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, allRows.length]);

  const handleBulkMove = async (groupId: string) => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const lockedCustomers = selectedRows.filter((r) => r.original.document_metadata?.isLocked);
    if (lockedCustomers.length > 0) {
      alert(`Cannot move. ${lockedCustomers.length} selected customer(s) are locked.`);
      return;
    }

    const ids = selectedRows.map((r) => r.original.id);
    await bulkUpdateCustomerGroup(ids, groupId);
    refreshData();
    table.resetRowSelection();
  };

  if (isLoading) return <div className="text-muted-foreground text-center mt-20">Loading...</div>;

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden flex flex-col h-full">
      {selectedCount > 0 && (
        <div className="bg-primary/10 p-2 px-4 flex items-center justify-between border-b border-primary/20 animate-in slide-in-from-top-2 duration-200">
          <span className="text-primary text-xs font-bold">{selectedCount} selected</span>
          <StandardSelect
            onChange={(e) => handleBulkMove(e.target.value)}
            defaultValue=""
            className="py-1 px-2 h-7 min-w-[100px] text-xs"
            containerClassName="flex-row items-center gap-2 space-y-0"
            label="Move:"
          >
            <option value="" disabled className="bg-background">
              Select Group
            </option>
            <option value="ungrouped" className="bg-background">
              Ungrouped
            </option>
            {groups.map((g) => (
              <option key={g.id} value={g.id} className="bg-background">
                {g.name}
              </option>
            ))}
          </StandardSelect>
        </div>
      )}

      <div 
        onScroll={handleScroll}
        className="flex-1 overflow-auto w-full custom-scrollbar"
      >
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
          <tbody className="divide-y divide-border/30">
            {pagedRows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-accent/20 transition-colors group ${
                  row.getIsSelected() ? "bg-primary/5" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-1.5 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
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