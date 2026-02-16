"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CashoutRecord } from "../../lib/cashout.api"; // Import from lib/cashout.api
import { Trash2, ArrowUpDown, Truck, Lightbulb, ArrowRight, Store } from "lucide-react";

export const getColumns = (
  onDelete?: (id: string) => void,
  canDelete: boolean = false
): ColumnDef<CashoutRecord>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="w-4 h-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.getValue("date")}</span>
          <span className="text-xs text-gray-400">{row.original.timestamp}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      
      let style = "bg-gray-50 text-gray-700 border-gray-100";
      let Icon = Store;

      if (category === "COGS") {
        style = "bg-orange-50 text-orange-700 border-orange-100";
        Icon = Truck;
      } else if (category === "OPEX") {
        style = "bg-purple-50 text-purple-700 border-purple-100";
        Icon = Lightbulb;
      } else if (category === "REMITTANCE") {
        style = "bg-green-50 text-green-700 border-green-100";
        Icon = ArrowRight;
      }

      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${style}`}>
          <Icon size={12} />
          {category}
        </span>
      );
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const record = row.original;
      
      let mainText = "N/A";
      let subText = null;

      if (record.category === "OPEX") {
        mainText = record.expenseCategory || "Unclassified";
      } else if (record.category === "REMITTANCE") {
        mainText = record.subTypeLabel || "Transfer";
      } else {
        // COGS
        mainText = record.product || "No Product Specified";
      }

      if (record.notes) {
        subText = record.notes;
      }

      return (
        <div className="flex flex-col">
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {mainText}
          </div>
          {subText && (
            <div className="text-gray-500 text-xs mt-1 line-clamp-1 max-w-[200px]" title={subText}>
              {subText}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "reference",
    header: "Reference / Supplier",
    cell: ({ row }) => {
      const record = row.original;

      if (record.category === "COGS") {
        return (
           <div className="flex flex-col">
            <span className="font-medium text-gray-700">{record.manufacturer || 'Unknown Mfr.'}</span>
            <span className="text-xs font-mono text-gray-400">{record.receiptNo || 'NO RECEIPT'}</span>
          </div>
        );
      }
      
      if (record.category === "REMITTANCE") {
        return <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{record.referenceNo || "-"}</span>;
      }

      return <span className="text-gray-300">-</span>;
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);

      return (
        <div className="text-right font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg inline-block float-right">
          -{formatted}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      if (!canDelete) return null;
      
      return (
        <div className="flex justify-center">
          <button
            onClick={() => {
                if (window.confirm("Are you sure you want to delete this transaction?")) {
                    onDelete?.(row.original.id);
                }
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Transaction"
          >
            <Trash2 size={16} />
          </button>
        </div>
      );
    },
  },
];
