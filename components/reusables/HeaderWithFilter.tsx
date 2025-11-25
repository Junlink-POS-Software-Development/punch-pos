import React, { useState } from "react";
import { Filter } from "lucide-react";

interface HeaderWithFilterProps {
  column: { key: string; name: string | React.ReactNode };
  filters: Record<string, string>;
  onApplyFilter: (key: string, value: string) => void;
}

export const HeaderWithFilter: React.FC<HeaderWithFilterProps> = ({
  column,
  filters,
  onApplyFilter,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const columnKey = String(column.key);
  const currentValue = filters[columnKey] || "";

  return (
    <div className="group relative flex justify-between items-center w-full">
      <span>{column.name}</span>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1 rounded transition-colors ${
            currentValue ? "text-blue-400" : "text-gray-600 hover:text-gray-300"
          }`}
        >
          <Filter className="w-3 h-3" />
        </button>

        {isOpen && (
          <div className="top-full right-0 z-50 absolute bg-gray-800 shadow-xl mt-2 p-2 border border-gray-700 rounded w-48">
            <input
              autoFocus
              type="text"
              placeholder={`Filter ${column.name}...`}
              className="bg-gray-900 p-2 border border-gray-700 focus:border-blue-500 rounded outline-none w-full text-gray-200 text-xs"
              value={currentValue}
              onChange={(e) => onApplyFilter(columnKey, e.target.value)}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="mt-1 w-full text-[10px] text-gray-500 hover:text-gray-300 text-right"
            >
              Close
            </button>
          </div>
        )}

        {/* Overlay to close when clicking outside */}
        {isOpen && (
          <div
            className="z-40 fixed inset-0"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
