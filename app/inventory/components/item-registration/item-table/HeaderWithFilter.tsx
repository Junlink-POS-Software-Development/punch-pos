import React, { useState, useMemo, useEffect, useRef } from "react";
// 1. Import createPortal
import { createPortal } from "react-dom";
import { Filter, ArrowUp, ArrowDown, Search, Check } from "lucide-react";
import { Item } from "../utils/itemTypes";

interface HeaderWithFilterProps {
  column: { key: string; name: string | React.ReactNode };
  allData: Item[];
  filters: Record<string, string[]>;
  onApplyFilter: (key: string, values: string[]) => void;
  sortState?: { col: keyof Item | null; dir: "ASC" | "DESC" | null };
  onSort?: (col: keyof Item, dir: "ASC" | "DESC" | null) => void;
}

export const HeaderWithFilter: React.FC<HeaderWithFilterProps> = ({
  column,
  allData,
  filters,
  onApplyFilter,
  sortState,
  onSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const columnKey = String(column.key);
  
  // Get unique values for this column
  const uniqueValues = useMemo(() => {
    const values = new Set<string>();
    allData.forEach((item) => {
      const val = item[columnKey as keyof Item];
      if (val !== null && val !== undefined) {
        values.add(String(val));
      }
    });
    return Array.from(values).sort();
  }, [allData, columnKey]);

  // Initialize selected values
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());

  // Sync internal state when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const currentFilters = filters[columnKey];
      if (currentFilters && currentFilters.length > 0) {
        setSelectedValues(new Set(currentFilters));
      } else {
        setSelectedValues(new Set(uniqueValues));
      }
      setSearchTerm("");
    }
  }, [isOpen, filters, columnKey, uniqueValues]);

  // Filter the list of values based on search term
  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    const lowerSearch = searchTerm.toLowerCase();
    return uniqueValues.filter((val) =>
      val.toLowerCase().includes(lowerSearch)
    );
  }, [uniqueValues, searchTerm]);



  const handleSelectAll = () => {
    if (selectedValues.size === filteredValues.length) {
      setSelectedValues(new Set());
    } else {
      const newSelected = new Set(selectedValues);
      filteredValues.forEach(val => newSelected.add(val));
      setSelectedValues(newSelected);
    }
  };

  const handleClear = () => setSelectedValues(new Set());

  const handleApply = () => {
    onApplyFilter(columnKey, Array.from(selectedValues));
    setIsOpen(false);
  };

  const isFiltered = filters[columnKey] && filters[columnKey].length > 0;
  const isSorted = sortState?.col === columnKey;

  // Refs for positioning
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position when open
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        zIndex: 9999,
        position: "fixed", // Explicitly ensure fixed here
        top: rect.bottom + 4,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
  }, [isOpen]);

  // 2. Define the dropdown content variable
  const dropdownContent = (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={() => setIsOpen(false)}
      />
      <div
        ref={dropdownRef}
        className="fixed w-64 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-2xl flex flex-col text-gray-200"
        style={dropdownStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sort Options */}
        {onSort && (
          <div className="p-2 border-b border-gray-800 flex flex-col gap-1">
            <button
              onClick={() => {
                onSort(columnKey as keyof Item, "ASC");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 rounded text-xs text-left transition-colors"
            >
              <ArrowUp className="w-3 h-3 text-gray-400" />
              Sort A to Z
            </button>
            <button
              onClick={() => {
                onSort(columnKey as keyof Item, "DESC");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 rounded text-xs text-left transition-colors"
            >
              <ArrowDown className="w-3 h-3 text-gray-400" />
              Sort Z to A
            </button>
          </div>
        )}

        {/* Search Box */}
        <div className="p-2 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded pl-7 pr-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Actions: Select All / Clear */}
        <div className="flex justify-between items-center px-3 py-2 text-[10px] text-blue-400 border-b border-gray-800">
          <button 
            onClick={handleSelectAll}
            className="hover:text-blue-300 transition-colors"
          >
            (Select All)
          </button>
          <button 
            onClick={handleClear}
            className="hover:text-blue-300 transition-colors"
          >
            (Clear)
          </button>
        </div>

        {/* Values List */}
        <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
          {filteredValues.length === 0 ? (
            <div className="p-2 text-center text-gray-500 text-xs italic">
              No matches found
            </div>
          ) : (
            filteredValues.map((val) => (
              <label
                key={val}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 rounded cursor-pointer group/item"
              >
                <input 
                  type="checkbox"
                  className="hidden"
                  checked={selectedValues.has(val)}
                  onChange={() => {
                    const newSelected = new Set(selectedValues);
                    if (newSelected.has(val)) newSelected.delete(val);
                    else newSelected.add(val);
                    setSelectedValues(newSelected);
                  }}
                />
                <div className={`
                  w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors
                  ${selectedValues.has(val) 
                    ? "bg-blue-500 border-blue-500" 
                    : "border-gray-600 group-hover/item:border-gray-500 bg-transparent"}
                `}>
                  {selectedValues.has(val) && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className="text-xs truncate select-none">{val}</span>
              </label>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t border-gray-800 flex justify-end gap-2 bg-gray-900/50 rounded-b-lg">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 rounded border border-gray-700 text-xs hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
          >
            OK
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="group relative flex justify-between items-center w-full h-full">
      <span className="flex-1 truncate" title={typeof column.name === 'string' ? column.name : ''}>
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
              : "text-gray-600 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          }`}
        >
          <Filter className="w-3 h-3" />
        </button>

        {/* 3. Render via Portal */}
        {isOpen && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
      </div>
    </div>
  );
};