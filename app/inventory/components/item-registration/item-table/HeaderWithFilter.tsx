// app/inventory/components/HeaderWithFilter.tsx

import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Filter, ArrowUp, ArrowDown, Search, Check, X, RotateCcw } from "lucide-react";

// Made generic <T> to support both Item and InventoryItem
interface HeaderWithFilterProps<T> {
  column: { key: string; name: string | React.ReactNode };
  allData: T[];
  filters: Record<string, string[]>;
  onApplyFilter: (key: string, values: string[]) => void;
  sortState?: { col: keyof T | null; dir: "ASC" | "DESC" | null };
  onSort?: (col: keyof T, dir: "ASC" | "DESC" | null) => void;
}

export const HeaderWithFilter = <T,>({
  column,
  allData,
  filters,
  onApplyFilter,
  sortState,
  onSort,
}: HeaderWithFilterProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const columnKey = String(column.key);

  // Get unique values for this column
  const uniqueValues = useMemo(() => {
    const values = new Set<string>();
    allData.forEach((item) => {
      const val = item[columnKey as keyof T];
      if (val !== null && val !== undefined) {
        values.add(String(val));
      }
    });
    return Array.from(values).sort();
  }, [allData, columnKey]);

  // Initialize selected values from props
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());

  // Sync internal state with external filters when menu opens
  useEffect(() => {
    if (isOpen) {
      if (filters[columnKey]) {
        setSelectedValues(new Set(filters[columnKey]));
      } else {
        // If no filter exists, usually means "All" are effectively selected,
        // but for the UI checkboxes, we might want to show all checked or none.
        // Standard Excel behavior: if no filter, all are checked.
        setSelectedValues(new Set(uniqueValues));
      }
    }
  }, [isOpen, filters, columnKey, uniqueValues]);

  const filteredValues = uniqueValues.filter((val) =>
    val.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleValue = (val: string) => {
    const newSet = new Set(selectedValues);
    if (newSet.has(val)) {
      newSet.delete(val);
    } else {
      newSet.add(val);
    }
    setSelectedValues(newSet);
  };

  const handleSelectAll = () => {
    if (selectedValues.size === filteredValues.length) {
      setSelectedValues(new Set());
    } else {
      setSelectedValues(new Set(filteredValues));
    }
  };

  const handleApply = () => {
    // If all are selected, we can technically send an empty filter to mean "show all"
    // or send all values. Sending empty array is cleaner for "no filter active".
    if (selectedValues.size === uniqueValues.length) {
      onApplyFilter(columnKey, []);
    } else {
      onApplyFilter(columnKey, Array.from(selectedValues));
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedValues(new Set(uniqueValues)); // Visually select all
    onApplyFilter(columnKey, []); // clear filter in parent
    setIsOpen(false);
  };

  const handleSort = (dir: "ASC" | "DESC") => {
    if (onSort) {
      onSort(columnKey as keyof T, dir);
      setIsOpen(false);
    }
  };

  // --- Portal Logic ---
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX - 200, // Shift left to keep on screen
      });
    }
  }, [isOpen]);

  // Determine if this column is currently active (filtered or sorted)
  const isFiltered = filters[columnKey] && filters[columnKey].length > 0;
  const isSorted = sortState?.col === columnKey;

  // Render Portal Content
  const menu = isOpen ? (
    createPortal(
      <>
        {/* Backdrop to close */}
        <div
          className="z-[9999] fixed inset-0"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Dropdown Menu */}
        <div
          className="z-[10000] absolute bg-slate-800 shadow-2xl border border-slate-700 rounded-lg w-64 text-slate-200 overflow-hidden"
          style={{ top: coords.top, left: Math.max(10, coords.left) }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sort Options */}
          {onSort && (
            <div className="border-slate-700 p-2 border-b">
              <button
                onClick={() => handleSort("ASC")}
                className="flex items-center gap-2 hover:bg-slate-700/50 p-2 rounded w-full text-left text-sm"
              >
                <ArrowUp className="w-4 h-4 text-slate-400" /> Sort Ascending
              </button>
              <button
                onClick={() => handleSort("DESC")}
                className="flex items-center gap-2 hover:bg-slate-700/50 p-2 rounded w-full text-left text-sm"
              >
                <ArrowDown className="w-4 h-4 text-slate-400" /> Sort Descending
              </button>
            </div>
          )}

          {/* Search */}
          <div className="p-2">
            <div className="relative">
              <Search className="top-2.5 left-2 absolute w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 focus:border-blue-500 pl-8 p-1.5 border border-slate-700 rounded w-full text-xs focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Value List */}
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            <div
              className="flex items-center gap-2 hover:bg-slate-700/50 px-3 py-1.5 cursor-pointer"
              onClick={handleSelectAll}
            >
              <div
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  selectedValues.size === filteredValues.length
                    ? "bg-blue-600 border-blue-600"
                    : "border-slate-500"
                }`}
              >
                {selectedValues.size === filteredValues.length && (
                  <Check className="w-2.5 h-2.5 text-white" />
                )}
              </div>
              <span className="font-medium text-xs text-blue-300">
                (Select All)
              </span>
            </div>

            {filteredValues.map((val) => (
              <div
                key={val}
                className="flex items-center gap-2 hover:bg-slate-700/50 px-3 py-1.5 cursor-pointer"
                onClick={() => toggleValue(val)}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    selectedValues.has(val)
                      ? "bg-blue-600 border-blue-600"
                      : "border-slate-500"
                  }`}
                >
                  {selectedValues.has(val) && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span className="text-xs truncate">{val}</span>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center bg-slate-900 p-2 border-t border-slate-700">
            {/* Added Reset Button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 hover:bg-slate-800 px-2 py-1 rounded text-gray-400 hover:text-white text-xs transition-colors"
              title="Clear Filter"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded text-slate-400 hover:text-slate-200 text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 px-3 py-1 rounded text-white text-xs transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </>,
      document.body
    )
  ) : null;

  return (
    <div className="group relative flex justify-between items-center w-full h-full">
      <span
        className="flex-1 truncate"
        title={typeof column.name === "string" ? column.name : ""}
      >
        {column.name}
      </span>

      <div className="relative flex items-center gap-1">
        {/* Sort Indicator */}
        {isSorted && (
          <span className="text-blue-400">
            {sortState?.dir === "ASC" ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
          </span>
        )}

        {/* Filter Button */}
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`p-1 rounded transition-colors ${
            isFiltered || isOpen
              ? "text-blue-400 bg-blue-400/10"
              : "text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
      </div>
      {menu}
    </div>
  );
};