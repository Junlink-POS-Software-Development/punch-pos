import React, { useState } from "react";
import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { FilterDropdown } from "./FilterDropdown";

interface HeaderWithFilterProps<T> {
  column: { key: string; name: string | React.ReactNode };
  allData?: T[];
  filters: Record<string, string | string[]>;
  onApplyFilter: (key: string, values: any) => void;
  sortState?: {
    col: keyof T | null;
    dir: "ASC" | "DESC" | null;
  };
  onSort?: (col: keyof T, dir: "ASC" | "DESC" | null) => void;
}

export function HeaderWithFilter<T>({
  column,
  allData,
  filters,
  onApplyFilter,
  sortState,
  onSort,
}: HeaderWithFilterProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const columnKey = column.key as keyof T;
  const currentFilters = filters[column.key];
  const isSorted = sortState?.col === columnKey;
  const sortDir = isSorted ? sortState?.dir : null;

  const handleApply = (selectedValues: string[] | null, direction?: "ASC" | "DESC") => {
    if (selectedValues === null) {
      onApplyFilter(column.key, []);
    } else {
      onApplyFilter(column.key, selectedValues);
    }

    if (direction && onSort) {
      onSort(columnKey, direction);
    }
    setIsOpen(false);
  };

  return (
    <div className="group relative flex justify-between items-center w-full min-h-[40px] px-2">
      <div 
        className={`flex items-center gap-1 select-none grow ${onSort ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (!onSort) return;
          const nextDir = sortDir === "ASC" ? "DESC" : sortDir === "DESC" ? null : "ASC";
          onSort(columnKey, nextDir);
        }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
          {column.name}
        </span>
        {sortDir === "ASC" ? (
          <ArrowUp className="w-3 h-3 text-primary" />
        ) : sortDir === "DESC" ? (
          <ArrowDown className="w-3 h-3 text-primary" />
        ) : (
          <ArrowUpDown className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors" />
        )}
      </div>

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`p-1 rounded transition-colors ${
            (Array.isArray(currentFilters) ? currentFilters.length > 0 : !!currentFilters)
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Filter className="w-3 h-3" />
        </button>

        {isOpen && (
          allData ? (
            <FilterDropdown
              columnKey={columnKey as any}
              allData={allData as any}
              currentSelection={Array.isArray(currentFilters) ? currentFilters : []}
              onApply={handleApply}
              onClose={() => setIsOpen(false)}
            />
          ) : (
            <div className="top-full right-0 z-50 absolute bg-background shadow-xl mt-2 p-2 border border-border rounded w-48 animate-in duration-100 fade-in zoom-in-95">
              <input
                autoFocus
                type="text"
                placeholder={`Filter ${column.name}...`}
                className="bg-muted p-2 border border-input focus:border-ring rounded outline-none w-full text-foreground text-xs"
                value={typeof currentFilters === "string" ? currentFilters : ""}
                onChange={(e) => onApplyFilter(column.key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsOpen(false);
                }}
              />
              <button
                onClick={() => setIsOpen(false)}
                className="mt-1 w-full text-[10px] text-muted-foreground hover:text-foreground text-right"
              >
                Close
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
