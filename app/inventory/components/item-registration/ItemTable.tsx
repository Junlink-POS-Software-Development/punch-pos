// app/inventory/components/ItemTable.tsx

"use client";

import React, { useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom"; // Required for the dropdown to float above headers
import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { Item } from "./utils/itemTypes";
import { Edit, Trash2, Filter, XCircle } from "lucide-react";
import { FilterDropdown } from "@/components/reusables/FilterDropdown";

interface ItemTableProps {
  data: Item[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

// --- Helper: Safely stringify values for filtering ---
const safeString = (val: unknown) =>
  val === null || val === undefined ? "(Blanks)" : String(val);

// --- Component: Header with Portal Filter ---
const HeaderWithFilter = ({
  column,
  allData,
  filters,
  onApplyFilter,
}: {
  column: Column<Item>;
  allData: Item[];
  filters: Record<string, string[]>;
  // Updated type to accept null (for clearing filters)
  onApplyFilter: (
    key: string,
    vals: string[] | null,
    sort?: "ASC" | "DESC"
  ) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const columnKey = column.key as keyof Item;

  // Check if a filter is active for this specific column
  const isActive = !!filters[columnKey];

  // Toggle logic with position calculation
  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    // Calculate position to show portal relative to the button
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY, // Just below the button
        left: rect.right + window.scrollX, // Align to right edge
      });
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="group flex justify-between items-center w-full h-full">
        <span className="truncate">{column.name}</span>

        <button
          ref={buttonRef} // Attach ref here for positioning
          onClick={toggleOpen}
          className={`p-1 rounded hover:bg-gray-700 transition-opacity ml-1 ${
            isActive || isOpen
              ? "opacity-100 text-green-400 bg-gray-800"
              : "opacity-0 group-hover:opacity-100 text-gray-400"
          }`}
        >
          <Filter className="w-3 h-3" />
        </button>
      </div>

      {/* Render Dropdown via Portal */}
      {isOpen &&
        createPortal(
          <div
            className="z-2 isolate fixed inset-0" // High Z-index to float above everything
            onClick={() => setIsOpen(false)} // Click backdrop to close
          >
            {/* Wrapper to position the dropdown */}
            <div
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
            >
              <FilterDropdown
                columnKey={columnKey}
                allData={allData}
                currentSelection={filters[columnKey as string]}
                onClose={() => setIsOpen(false)}
                onApply={(vals, sortDir) => {
                  onApplyFilter(columnKey as string, vals, sortDir);
                  setIsOpen(false);
                }}
              />
            </div>
          </div>,
          document.body // Render into body
        )}
    </>
  );
};

// --- MAIN ITEM TABLE COMPONENT ---
export const ItemTable: React.FC<ItemTableProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [sortState, setSortState] = useState<{
    col: keyof Item | null;
    dir: "ASC" | "DESC" | null;
  }>({ col: null, dir: null });

  // --- Filter & Sort Logic ---
  const processedRows = useMemo(() => {
    let rows = [...data];

    // A. Filter
    Object.keys(activeFilters).forEach((key) => {
      const allowedValues = new Set(activeFilters[key]);
      // If allowedValues is empty, it effectively filters everything out unless logic is changed,
      // but typically we only add the key to activeFilters if it has values.
      if (allowedValues.size > 0) {
        rows = rows.filter((row) => {
          const val = safeString(row[key as keyof Item]);
          return allowedValues.has(val);
        });
      }
    });

    // B. Sort
    if (sortState.col && sortState.dir) {
      rows.sort((a, b) => {
        const colKey = sortState.col!;
        const valA = a[colKey];
        const valB = b[colKey];

        // Numeric sort
        if (typeof valA === "number" && typeof valB === "number") {
          return sortState.dir === "ASC" ? valA - valB : valB - valA;
        }

        // String sort
        const strA = valA !== null && valA !== undefined ? String(valA) : "";
        const strB = valB !== null && valB !== undefined ? String(valB) : "";

        return sortState.dir === "ASC"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }
    return rows;
  }, [data, activeFilters, sortState]);

  // --- Handler for Filter/Sort ---
  const handleApplyFilter = (
    key: string,
    values: string[] | null,
    sortDir?: "ASC" | "DESC"
  ) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (values === null) {
        // Remove filter if value is null (Clear Filter clicked)
        delete next[key];
      } else {
        // Otherwise update it
        next[key] = values;
      }
      return next;
    });

    if (sortDir) {
      setSortState({ col: key as keyof Item, dir: sortDir });
    }
  };

  // --- Clear All Filters ---
  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSortState({ col: null, dir: null });
  };

  // --- Columns Definition ---
  const columns: Column<Item>[] = useMemo(() => {
    const tailwindHeaderClass =
      "bg-transparent text-gray-400 border-b border-gray-700 font-semibold uppercase text-xs flex items-center";

    const createColumn = (
      key: keyof Item,
      name: string,
      width?: number
    ): Column<Item> => ({
      key,
      name,
      width,
      headerCellClass: tailwindHeaderClass,
      renderHeaderCell: (props) => (
        <HeaderWithFilter
          column={props.column}
          allData={data}
          filters={activeFilters}
          onApplyFilter={handleApplyFilter}
        />
      ),
    });

    return [
      createColumn("itemName", "Item Name"),
      createColumn("sku", "SKU / Barcode"),
      createColumn("category", "Category"),
      {
        ...createColumn("costPrice", "Cost Price", 120),
        renderCell: ({ row }) =>
          typeof row.costPrice === "number"
            ? `₱${row.costPrice.toFixed(2)}`
            : "N/A",
      },
      createColumn("description", "Description"),
      {
        key: "actions",
        name: "Actions",
        width: 100,
        headerCellClass: tailwindHeaderClass,
        renderCell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                // CRITICAL: Find index in ORIGINAL data, not sorted/filtered view
                const originalIndex = data.findIndex((i) => i.id === row.id);
                if (originalIndex !== -1) onEdit(originalIndex);
              }}
              className="hover:bg-blue-400/20 p-1 rounded text-blue-300 hover:text-blue-100"
              title="Edit Item"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                // CRITICAL: Find index in ORIGINAL data
                const originalIndex = data.findIndex((i) => i.id === row.id);
                if (originalIndex !== -1) onDelete(originalIndex);
              }}
              className="hover:bg-red-400/20 p-1 rounded text-red-400 hover:text-red-200"
              title="Delete Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];
  }, [data, activeFilters, onEdit, onDelete]);

  return (
    <div className="pb-40 overflow-x-auto">
      <div className="flex items-center gap-4 mb-4">
        <h3 className="font-semibold text-gray-200 text-lg">
          Registered Items
        </h3>

        {/* "Clear All" Button - Only shows when filters are active */}
        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={handleClearAllFilters}
            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 px-2 py-1 border border-red-500/30 rounded text-red-400 text-xs transition-all"
          >
            <XCircle className="w-3 h-3" /> Clear All Filters
          </button>
        )}
      </div>

      <DataGrid<Item>
        columns={columns}
        rows={processedRows} // Use the filtered/sorted rows here
        rowKeyGetter={(row: Item) => row.id!}
        className="border-none"
        rowClass={(_, index) =>
          `rdg-row bg-transparent text-[80%] text-gray-200 hover:bg-gray-700/40 border-b border-gray-800`
        }
      />
    </div>
  );
};
