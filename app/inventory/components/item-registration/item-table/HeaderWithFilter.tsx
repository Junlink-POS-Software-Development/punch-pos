// app/inventory/components/item-registration/HeaderWithFilter.tsx

"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { RenderHeaderCellProps } from "react-data-grid";
import { Item } from "../utils/itemTypes";
import { Filter } from "lucide-react";
import { FilterDropdown } from "@/components/reusables/FilterDropdown"; // Ensure this path is correct

export interface HeaderWithFilterProps extends RenderHeaderCellProps<Item> {
  allData: Item[];
  filters: Record<string, string[]>;
  onApplyFilter: (
    key: string,
    vals: string[] | null,
    sort?: "ASC" | "DESC"
  ) => void;
}

export const HeaderWithFilter = ({
  column,
  allData,
  filters,
  onApplyFilter,
}: HeaderWithFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const columnKey = column.key as keyof Item;

  const isActive = !!filters[columnKey];

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
      });
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="group flex justify-between items-center w-full h-full">
        <span className="truncate">{column.name}</span>
        <button
          ref={buttonRef}
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

      {isOpen &&
        createPortal(
          <div
            className="z-2 isolate fixed inset-0"
            onClick={() => setIsOpen(false)}
          >
            <div
              style={{
                position: "absolute",
                top: coords.top,
                left: coords.left,
              }}
              onClick={(e) => e.stopPropagation()}
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
          document.body
        )}
    </>
  );
};
