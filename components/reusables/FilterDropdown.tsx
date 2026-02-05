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
    <div className="top-full right-0 z-50 absolute flex flex-col bg-background shadow-xl mt-1 border border-border rounded-md w-64 text-foreground origin-top-right animate-in duration-100 fade-in zoom-in-95">
      {/* Sort Section */}
      <div className="flex flex-col gap-1 p-2 border-border border-b">
        <button
          onClick={() => onApply(Array.from(selectedValues), "ASC")}
          className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-sm text-sm text-left transition-colors"
        >
          <ArrowUpAZ className="w-4 h-4" /> Sort A to Z
        </button>
        <button
          onClick={() => onApply(Array.from(selectedValues), "DESC")}
          className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-sm text-sm text-left transition-colors"
        >
          <ArrowDownZA className="w-4 h-4" /> Sort Z to A
        </button>
      </div>

      {/* Filter Section */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="font-semibold text-muted-foreground">Filter by values</span>
        </div>

        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="top-2.5 left-2 absolute w-3 h-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-muted py-1 pl-7 border border-input focus:border-ring rounded focus:outline-none w-full text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Select All / Clear Selection */}
        <div className="flex gap-3 mb-2 px-1 text-primary text-xs">
          <button onClick={handleSelectAll} className="hover:underline">
            Select all
          </button>
          <button onClick={handleClearSelection} className="hover:underline">
            Unselect all
          </button>
        </div>

        {/* Checkbox List */}
        <div className="bg-muted/30 p-1 border border-border rounded h-32 overflow-y-auto thin-scrollbar">
          {displayedValues.length === 0 && (
            <div className="p-2 text-muted-foreground text-xs text-center">
              No matches
            </div>
          )}
          {displayedValues.map((val) => (
            <label
              key={val}
              className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                className="bg-background border-border rounded focus:ring-0 focus:ring-offset-0 text-primary"
                checked={selectedValues.has(val)}
                onChange={() => toggleValue(val)}
              />
              <span className="text-xs truncate select-none">{val}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center bg-muted/30 p-2 border-border border-t">
        {/* NEW: Clear Filter Button (Only shows if filter is active) */}
        <div>
          {isFilterActive && (
            <button
              onClick={() => onApply(null)} // Pass null to remove filter
              className="flex items-center gap-1 hover:bg-red-500/10 px-2 py-1 rounded text-red-500 hover:text-red-600 text-xs transition-colors"
              title="Remove filter from this column"
            >
              <Trash className="w-3 h-3" /> Clear Filter
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="hover:bg-muted px-3 py-1 rounded text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(Array.from(selectedValues))}
            className="bg-primary hover:bg-primary/90 px-3 py-1 rounded font-semibold text-primary-foreground text-xs transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
