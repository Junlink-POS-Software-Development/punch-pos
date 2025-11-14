"use client";

import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

// Special value to represent blank/empty entries
const BLANK_VALUE = "(Blanks)";

interface ColumnFilterProps {
  allValues: (string | null | undefined)[];
  appliedFilters: Set<string>;
  onApply: (selectedValues: Set<string>) => void;
  onClose: () => void;
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({
  allValues,
  appliedFilters,
  onApply,
  onClose,
}) => {
  // 1. Get all unique, sorted values, replacing blanks
  const uniqueValues = useMemo(() => {
    const valuesSet = new Set<string>();
    allValues.forEach((val) => {
      if (val === null || val === undefined || val === "") {
        valuesSet.add(BLANK_VALUE);
      } else {
        valuesSet.add(String(val));
      }
    });
    return Array.from(valuesSet).sort();
  }, [allValues]);

  // 2. Component State
  const [searchValue, setSearchValue] = useState("");
  const [selectedValues, setSelectedValues] = useState(appliedFilters);

  // 3. Derived filtered list based on search
  const filteredList = useMemo(() => {
    if (!searchValue) return uniqueValues;
    return uniqueValues.filter((val) =>
      val.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [uniqueValues, searchValue]);

  // 4. Event Handlers
  const handleToggle = (value: string) => {
    setSelectedValues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    // Selects all *visible* items from the search
    setSelectedValues((prev) => new Set([...prev, ...filteredList]));
  };

  const handleClear = () => {
    // Clears all *visible* items from the search
    const visibleSet = new Set(filteredList);
    setSelectedValues((prev) => {
      const newSet = new Set(prev);
      for (const val of newSet) {
        if (visibleSet.has(val)) {
          newSet.delete(val);
        }
      }
      return newSet;
    });
  };

  const handleApply = () => {
    onApply(selectedValues);
  };

  const handleCancel = () => {
    onClose();
  };

  const isAllVisibleSelected = filteredList.every((val) =>
    selectedValues.has(val)
  );

  return (
    // Popover Container
    <div className="top-full left-0 z-10 absolute bg-gray-800 shadow-xl mt-2 p-4 border border-gray-600 rounded-lg w-64 text-white">
      {/* Close Button */}
      <button
        onClick={handleCancel}
        className="top-2 right-2 absolute text-gray-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Search Bar */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Search values..."
          className="bg-gray-700 py-2 pr-2 pl-8 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Search className="top-1/2 left-2 absolute w-4 h-4 text-gray-400 -translate-y-1/2" />
      </div>

      {/* Action Links */}
      <div className="flex justify-between mb-2 text-sm">
        <button
          onClick={handleSelectAll}
          className="text-blue-400 hover:underline"
          disabled={isAllVisibleSelected}
        >
          Select all
        </button>
        <button onClick={handleClear} className="text-blue-400 hover:underline">
          Clear
        </button>
      </div>

      {/* Checklist */}
      <div className="space-y-2 pr-1 max-h-48 overflow-y-auto custom-scrollbar">
        {filteredList.map((value) => (
          <label
            key={value}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              className="bg-gray-700 border-gray-600 rounded focus:ring-blue-500 text-blue-500 form-checkbox"
              checked={selectedValues.has(value)}
              onChange={() => handleToggle(value)}
            />
            <span className="text-sm">{value}</span>
          </label>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handleCancel}
          className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md font-medium text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md font-medium text-sm"
        >
          OK
        </button>
      </div>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #2d3748; /* gray-800 */
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a5568; /* gray-600 */
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096; /* gray-500 */
          }
        `}
      </style>
    </div>
  );
};
