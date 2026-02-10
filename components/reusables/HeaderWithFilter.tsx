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
            currentValue ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="w-3 h-3" />
        </button>

        {isOpen && (
          <div className="top-full right-0 z-50 absolute bg-background shadow-xl mt-2 p-2 border border-border rounded w-48 animate-in duration-100 fade-in zoom-in-95">
            <input
              autoFocus
              type="text"
              placeholder={`Filter ${column.name}...`}
              className="bg-muted p-2 border border-input focus:border-ring rounded outline-none w-full text-foreground text-xs"
              value={currentValue}
              onChange={(e) => onApplyFilter(columnKey, e.target.value)}
            />
            <button
              onClick={() => setIsOpen(false)}
              className="mt-1 w-full text-[10px] text-muted-foreground hover:text-foreground text-right"
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
