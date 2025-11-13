// components/inventory/FilterDropdown.tsx
import React, { useState, useMemo } from "react";
import { Search, ArrowUpAZ, ArrowDownZA, Trash } from "lucide-react"; // Added Trash icon
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";

interface FilterDropdownProps {
  columnKey: keyof Item;
  allData: Item[];
  // Updated: Accepts null to signal "remove filter"
  onApply: (
    selectedValues: string[] | null,
    sortDirection?: "ASC" | "DESC"
  ) => void;
  onClose: () => void;
  currentSelection?: string[];
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  columnKey,
  allData,
  onApply,
  onClose,
  currentSelection,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Extract unique values
  const uniqueValues = useMemo(() => {
    const values = Array.from(
      new Set(
        allData.map((row) => {
          const val = row[columnKey];
          return val !== undefined && val !== null ? String(val) : "(Blanks)";
        })
      )
    );
    return values.sort();
  }, [allData, columnKey]);

  // 2. Initialize state
  const [selectedValues, setSelectedValues] = useState<Set<string>>(() => {
    if (currentSelection && currentSelection.length > 0) {
      return new Set(currentSelection);
    }
    return new Set(uniqueValues);
  });

  // Check if this filter is currently active (to show the Clear button)
  const isFilterActive = !!currentSelection;

  // 3. Filter the list based on Search
  const displayedValues = uniqueValues.filter((val) =>
    val.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleValue = (val: string) => {
    const next = new Set(selectedValues);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    setSelectedValues(next);
  };

  const handleSelectAll = () => {
    setSelectedValues(new Set(displayedValues));
  };

  const handleClearSelection = () => {
    setSelectedValues(new Set());
  };

  return (
    <div className="top-full right-0 z-50 absolute flex flex-col bg-slate-800 shadow-xl mt-1 border border-slate-600 rounded-md w-64 text-gray-200 origin-top-right animate-in duration-100 fade-in zoom-in-95">
      {/* Sort Section */}
      <div className="flex flex-col gap-1 p-2 border-slate-600 border-b">
        <button
          onClick={() => onApply(Array.from(selectedValues), "ASC")}
          className="flex items-center gap-2 hover:bg-slate-700 p-2 rounded-sm text-sm text-left"
        >
          <ArrowUpAZ className="w-4 h-4" /> Sort A to Z
        </button>
        <button
          onClick={() => onApply(Array.from(selectedValues), "DESC")}
          className="flex items-center gap-2 hover:bg-slate-700 p-2 rounded-sm text-sm text-left"
        >
          <ArrowDownZA className="w-4 h-4" /> Sort Z to A
        </button>
      </div>

      {/* Filter Section */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="font-semibold text-slate-400">Filter by values</span>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="top-2.5 left-2 absolute w-3 h-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-900 py-1 pl-7 border border-slate-600 focus:border-blue-500 rounded focus:outline-none w-full text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Select All / Clear Selection */}
        <div className="flex gap-3 mb-2 px-1 text-blue-400 text-xs">
          <button onClick={handleSelectAll} className="hover:underline">
            Select all
          </button>
          <button onClick={handleClearSelection} className="hover:underline">
            Unselect all
          </button>
        </div>

        {/* Checkbox List */}
        <div className="bg-slate-900/50 p-1 border border-slate-700 rounded h-32 overflow-y-auto thin-scrollbar">
          {displayedValues.length === 0 && (
            <div className="p-2 text-slate-500 text-xs text-center">
              No matches
            </div>
          )}
          {displayedValues.map((val) => (
            <label
              key={val}
              className="flex items-center gap-2 hover:bg-slate-800 px-2 py-1 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                className="bg-slate-700 border-slate-600 rounded focus:ring-0 focus:ring-offset-0 text-blue-500"
                checked={selectedValues.has(val)}
                onChange={() => toggleValue(val)}
              />
              <span className="text-xs truncate select-none">{val}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center bg-slate-800/50 p-2 border-slate-600 border-t">
        {/* NEW: Clear Filter Button (Only shows if filter is active) */}
        <div>
          {isFilterActive && (
            <button
              onClick={() => onApply(null)} // Pass null to remove filter
              className="flex items-center gap-1 hover:bg-red-900/30 px-2 py-1 rounded text-red-400 hover:text-red-300 text-xs transition-colors"
              title="Remove filter from this column"
            >
              <Trash className="w-3 h-3" /> Clear Filter
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="hover:bg-slate-700 px-3 py-1 rounded text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(Array.from(selectedValues))}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded font-semibold text-white text-xs"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
