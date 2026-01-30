// app/inventory/components/item-registration/ItemTable.tsx

"use client";

import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { DataGrid, Column, RenderEditCellProps } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { XCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, Loader2, Plus } from "lucide-react";
import { Item } from "../utils/itemTypes";

// Imports from our new modular files
import { useProcessedItems } from "./hooks/useProcessedItems";
import { HeaderWithFilter } from "./HeaderWithFilter";
import { ItemActions } from "./ItemActions";

interface ItemTableProps {
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onSaveEdit?: (item: Item) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  totalItems?: number;
  onAdd?: () => void;
}

// Text editor for editable cells
function TextEditor<T>({ row, column, onRowChange, onClose }: RenderEditCellProps<T>) {
  const value = row[column.key as keyof T];
  return (
    <input
      className="w-full h-full bg-gray-800 text-white border border-blue-500 rounded px-2 outline-none"
      autoFocus
      value={value as string ?? ""}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}

// Number editor for costPrice and lowStockThreshold
function NumberEditor<T>({ row, column, onRowChange, onClose }: RenderEditCellProps<T>) {
  const value = row[column.key as keyof T];
  return (
    <input
      type="number"
      className="w-full h-full bg-gray-800 text-white border border-blue-500 rounded px-2 outline-none"
      autoFocus
      value={value as number ?? ""}
      onChange={(e) => {
        const val = e.target.value === "" ? null : parseFloat(e.target.value);
        onRowChange({ ...row, [column.key]: val });
      }}
      onBlur={() => onClose(true)}
    />
  );
}

export const ItemTable: React.FC<ItemTableProps> = ({
  data,
  onEdit,
  onDelete,
  onSaveEdit,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  totalItems,
  onAdd,
}) => {
  // State for tracking which row is being edited
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  // State for the edited row data
  const [editedRow, setEditedRow] = useState<Item | null>(null);

  // 1. Use the Hook
  const {
    rows,
    searchTerm,
    handleSearch,
    activeFilters,
    sortState,
    handleSort,
    handleApplyFilter,
    handleClearAllFilters,
  } = useProcessedItems(data);

  // --- Infinite Scroll Setup ---
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

  // Handle entering edit mode
  const handleStartEdit = useCallback((row: Item) => {
    setEditingRowId(row.id!);
    setEditedRow({ ...row });
  }, []);

  // Handle saving edits
  const handleSaveEdit = useCallback(() => {
    if (editedRow && onSaveEdit) {
      onSaveEdit(editedRow);
    }
    setEditingRowId(null);
    setEditedRow(null);
  }, [editedRow, onSaveEdit]);

  // Handle canceling edits
  const handleCancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditedRow(null);
  }, []);

  // Handle row changes during inline editing
  const handleRowsChange = useCallback((rows: Item[]) => {
    const changedRow = rows.find((r) => r.id === editingRowId);
    if (changedRow) {
      setEditedRow(changedRow);
    }
  }, [editingRowId]);

  // Merge edited row into displayed rows
  const displayRows = useMemo(() => {
    if (!editingRowId || !editedRow) return rows;
    return rows.map((row) => 
      row.id === editingRowId ? editedRow : row
    );
  }, [rows, editingRowId, editedRow]);

  // 2. Define Columns
  const columns: Column<Item>[] = useMemo(() => {
    const headerClass =
      "bg-slate-950/80 backdrop-blur-md text-gray-400 border-b border-gray-700 font-semibold uppercase text-xs flex items-center z-50";

    const createColumn = (
      key: keyof Item,
      name: string,
      width?: number
    ): Column<Item> => ({
      key,
      name,
      width,
      headerCellClass: headerClass,
    });

    return [
      {
        ...createColumn("itemName", "Item Name"),
        headerCellClass: `${headerClass} cursor-pointer hover:text-white transition-colors`,
        renderHeaderCell: () => (
          <div 
            className="flex items-center gap-2 w-full h-full"
            onClick={() => {
              const nextDir = sortState.col === "itemName" && sortState.dir === "ASC" ? "DESC" : "ASC";
              handleSort("itemName", nextDir);
            }}
          >
            <span>Item Name</span>
            {sortState.col === "itemName" ? (
              sortState.dir === "ASC" ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-30" />
            )}
          </div>
        ),
        editable: (row: Item) => row.id === editingRowId,
        renderEditCell: TextEditor,
      },
      {
        ...createColumn("sku", "SKU / Barcode"),
        editable: (row: Item) => row.id === editingRowId,
        renderEditCell: TextEditor,
      },
      {
        ...createColumn("categoryName", "Category"),
        renderHeaderCell: (props) => (
          <HeaderWithFilter
            {...props}
            allData={data}
            filters={activeFilters}
            onApplyFilter={handleApplyFilter}
          />
        ),
      },
      {
        ...createColumn("costPrice", "Cost Price", 120),
        headerCellClass: `${headerClass} flex justify-end pr-8`,
        editable: (row: Item) => row.id === editingRowId,
        renderEditCell: NumberEditor,
        renderCell: ({ row }: { row: Item }) => (
          <div className="text-right pr-4 font-mono font-semibold text-blue-400">
            {typeof row.costPrice === "number"
              ? `₱${row.costPrice.toFixed(2)}`
              : "N/A"}
          </div>
        ),
      },
      {
        ...createColumn("lowStockThreshold", "Low Stock", 130),
        headerCellClass: `${headerClass} flex justify-end pr-8`,
        editable: (row: Item) => row.id === editingRowId,
        renderEditCell: NumberEditor,
        renderCell: ({ row }: { row: Item }) => {
          const val = row.lowStockThreshold ?? 0;
          const isLow = val < 100;
          return (
            <div className="flex justify-end pr-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 transition-all ${
                isLow 
                  ? "bg-red-500/10 text-red-400 ring-red-500/20" 
                  : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
              }`}>
                {val}
              </span>
            </div>
          );
        }
      },
      ...((data.some(item => item.description && item.description.trim() !== "")) ? [
        {
          ...createColumn("description", "Description"),
          editable: (row: Item) => row.id === editingRowId,
          renderEditCell: TextEditor,
        }
      ] : []),
      {
        key: "actions",
        name: "Actions",
        width: 140,
        headerCellClass: `${headerClass} flex justify-center`,
        renderCell: ({ row }: { row: Item }) => (
          <div className="flex justify-center w-full">
            <ItemActions
              row={row}
              data={data}
              onEdit={onEdit}
              onDelete={onDelete}
              isEditing={row.id === editingRowId}
              onStartEdit={() => handleStartEdit(row)}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          </div>
        ),
      },
    ];
  }, [data, activeFilters, handleApplyFilter, onEdit, onDelete, sortState, handleSort, editingRowId, handleStartEdit, handleSaveEdit, handleCancelEdit]);

  // 3. Render
  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Table Header / Title Area */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2 bg-slate-950/20 border-b border-slate-800/50">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-100 text-lg tracking-tight uppercase font-lexend">
              Registered Items
              </h3>
              {onAdd && (
                 <button
                 onClick={onAdd}
                 className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-xs font-semibold text-white transition-all shadow-lg shadow-blue-900/20 active:scale-95 border border-blue-400/20"
               >
                 <Plus className="w-3.5 h-3.5" />
                 Register New Item
               </button>
              )}
            </div>
            
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bg-slate-950/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all w-64 shadow-inner"
                />
            </div>
            {Object.keys(activeFilters).length > 0 && (
                <button
                    onClick={handleClearAllFilters}
                    className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 border border-red-500/30 rounded text-red-400 text-xs transition-all animate-in fade-in zoom-in duration-200"
                >
                    <XCircle className="w-3 h-3" /> Clear Filters
                </button>
            )}
        </div>
        <div className="text-sm font-medium text-gray-500 bg-slate-800/30 px-3 py-1 rounded-full border border-slate-700/30">
            Showing <span className="text-gray-300">{rows.length}</span> {totalItems ? `of ${totalItems}` : ""} records
        </div>
      </div>

      {/* The Grid Container */}
      <div className="flex-1 overflow-hidden relative border border-slate-800 rounded-lg shadow-2xl">
        <DataGrid<Item>
            columns={columns}
            rows={displayRows}
            rowKeyGetter={(row) => row.id!}
            rowHeight={52}
            className="border-none h-full rdg-dark bg-transparent"
            style={{ height: "100%" }}
            rowClass={(row: Item) =>
            `rdg-row bg-transparent text-[90%] text-gray-300 hover:bg-slate-800/50 border-b border-slate-800/50 transition-colors ${row.id === editingRowId ? "ring-1 ring-blue-500/30 bg-blue-500/5 shadow-inner" : ""}`
            }
            onRowsChange={handleRowsChange}
        />
        
        {/* Loading Overlay for next page */}
        {isFetchingNextPage && (
            <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-sm p-4 flex justify-center items-center z-50 border-t border-slate-700">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading more items...</span>
                </div>
            </div>
        )}

        {/* Sentinel - positioned slightly above the bottom to trigger earlier */}
        <div ref={observerTarget} className="h-20 w-full bg-transparent absolute bottom-0 pointer-events-none" />
      </div>
    </div>
  );
};