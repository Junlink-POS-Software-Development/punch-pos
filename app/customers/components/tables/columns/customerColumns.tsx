import React from "react";
import {
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import {
  CheckSquare,
  Square,
  Lock,
  Trash2,
  Edit2,
  Unlock,
  ArrowUpDown,
  Trophy,
} from "lucide-react";
import { StandardSelect } from "@/components/reusables/StandardSelect";
import { formatDisplayName, getLastName } from "../../../lib/customer.utils";
import { Customer, CustomerGroup } from "../../../lib/types";

// ─── Table Meta Extension ───────────────────────────────────────────────────
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    // CustomerTable
    showTopSpendersOnly?: boolean;
    // CashOutTable
    editingRowId?: string | null;
    setEditingRowId?: (id: string | null) => void;
    updateData?: (id: string, values: any) => Promise<boolean>;
    isUpdating?: boolean;
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface CustomerColumnActions {
  handleViewCustomer: (customerId: string) => void;
  handleToggleLock: (customerId: string, isLocked: boolean, metadata: Record<string, any>) => void;
  handleDeleteCustomer: (customerId: string, isLocked: boolean) => void;
  handleGroupChange: (customerId: string, groupId: string, isLocked: boolean) => void;
}

interface CustomerColumnsOptions {
  groups: CustomerGroup[];
  isSortedByLastName: boolean;
  actions: CustomerColumnActions;
}

// ─── Column Factory ─────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Customer>();

export function getCustomerColumns({
  groups,
  isSortedByLastName,
  actions,
}: CustomerColumnsOptions): ColumnDef<Customer, any>[] {
  return [
    // ─── Select ───────────────────────────────────────────────────────
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

    // ─── Name ─────────────────────────────────────────────────────────
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
      cell: ({ row, getValue, table }) => {
        const c = row.original;
        const isLocked = c.document_metadata?.isLocked || false;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.handleViewCustomer(c.id);
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
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold truncate max-w-[140px]">
                  {formatDisplayName(getValue() || "Unknown", isSortedByLastName)}
                </span>
                {table.options.meta?.showTopSpendersOnly && (row.index < 3) && (
                  <div className={`p-1 rounded-full ${
                    row.index === 0 ? "bg-amber-500/20 text-amber-600" :
                    row.index === 1 ? "bg-slate-400/20 text-slate-600" :
                    "bg-orange-500/20 text-orange-600"
                  }`}>
                    <Trophy size={10} />
                  </div>
                )}
              </div>
              {table.options.meta?.showTopSpendersOnly && (
                <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">
                  Rank #{row.index + 1}
                </span>
              )}
            </div>
          </button>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = getLastName(rowA.original.full_name || "");
        const b = getLastName(rowB.original.full_name || "");
        return a.localeCompare(b);
      },
    }),

    // ─── Contact ──────────────────────────────────────────────────────
    columnHelper.accessor("phone_number", {
      id: "contact",
      header: "Contact",
      cell: (info) => (
        <span className="text-xs text-muted-foreground font-medium">
          {info.getValue() || "-"}
        </span>
      ),
    }),

    // ─── Spent ────────────────────────────────────────────────────────
    columnHelper.accessor("total_spent", {
      id: "spent",
      header: "Spent",
      cell: (info) => (
        <span className="text-xs font-bold text-foreground">
          ₱{(info.getValue() || 0).toLocaleString()}
        </span>
      ),
    }),

    // ─── Orders ───────────────────────────────────────────────────────
    columnHelper.accessor("visit_count", {
      id: "orders",
      header: "Orders",
      cell: (info) => (
        <span className="text-xs font-medium text-muted-foreground">
          {info.getValue() || 0}
        </span>
      ),
    }),

    // ─── Last Visit ───────────────────────────────────────────────────
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

    // ─── Membership ───────────────────────────────────────────────────
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
                actions.handleGroupChange(c.id, e.target.value, isLocked);
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

    // ─── Joined ───────────────────────────────────────────────────────
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

    // ─── Actions ──────────────────────────────────────────────────────
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
                actions.handleToggleLock(c.id, isLocked, c.document_metadata || {});
              }}
              className={`p-1 rounded hover:bg-muted ${
                isLocked ? "text-yellow-500" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                actions.handleViewCustomer(c.id);
              }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                actions.handleDeleteCustomer(c.id, isLocked);
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
  ] as ColumnDef<Customer, any>[];
}
