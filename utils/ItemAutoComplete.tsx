"use client";

import React, { useState, useMemo, useEffect, useRef, forwardRef } from "react";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { InventoryItem } from "@/app/inventory/components/stocks-monitor/lib/inventory.api";

export interface ItemAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  error?: string;
  onItemSelect?: (item: InventoryItem) => void;
  className?: string;
  id?: string;
  // 1. FIX: Add onKeyDown to the interface
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const ItemAutocomplete = forwardRef<HTMLInputElement, ItemAutocompleteProps>(
  (
    {
      className,
      value,
      onChange,
      onBlur,
      disabled,
      error,
      onItemSelect,
      id,
      onKeyDown, // 2. FIX: Destructure onKeyDown from props
      onFocus,
    },
    ref
  ) => {
    const { inventory: items } = useInventory();
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    const suggestions = useMemo(() => {
      if (!value) return [];
      return items
        .filter((item) =>
          item.item_name.toLowerCase().includes(value.toLowerCase()) ||
          item.sku.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 10);
    }, [items, value]);

    const handleSelect = (item: InventoryItem) => {
      onChange(item.item_name);
      setIsOpen(false);
      setActiveIndex(-1);
      if (onItemSelect) {
        // Use setTimeout to ensure focus change happens after React state updates
        setTimeout(() => onItemSelect(item), 0);
      }
    };

    const handleInternalKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      // --- Internal Dropdown Navigation Logic ---
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (suggestions.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        setIsOpen(true);
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (suggestions.length === 0) return;
        setActiveIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
        setIsOpen(true);
        return;
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          // Case 1: Selecting from dropdown
          e.preventDefault();
          handleSelect(suggestions[activeIndex]);
          return; // Stop here, don't trigger external Enter logic
        }
        // Case 2: Just hitting Enter (submit/next field)
        // Fall through to external handler below
      }

      // 3. FIX: Call the external handler if it exists
      // This allows FormFields.tsx to catch 'Enter' and move focus to Quantity
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    useEffect(() => {
      if (activeIndex >= 0 && listRef.current) {
        const activeItem = listRef.current.children[
          activeIndex
        ] as HTMLLIElement;
        activeItem?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }, [activeIndex]);

    return (
      <div className="relative">
        <input
          ref={ref}
          id={id || "itemName"}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onBlur={() => {
            onBlur();
            setTimeout(() => setIsOpen(false), 200);
          }}
          onFocus={(e) => {
            if (onFocus) onFocus(e);
            if (value && suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleInternalKeyDown} // Use our wrapper function
          disabled={disabled}
          className={`${className} ${
            disabled ? "opacity-50 cursor-not-allowed text-slate-500" : ""
          } ${error ? "border-red-500" : ""}`}
          autoComplete="off"
        />
        {isOpen && suggestions.length > 0 && (
          <ul
            ref={listRef}
            className="z-50 absolute top-full left-0 bg-card/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] mt-2 border border-border/50 rounded-xl w-full max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {suggestions.map((item, index) => (
              <li
                key={item.item_id}
                className={`px-4 py-3 cursor-pointer transition-all duration-150 flex flex-col gap-0.5 ${
                  index === activeIndex
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.01] z-10 mx-1 rounded-lg"
                    : "text-foreground hover:bg-muted/80"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold tracking-tight text-sm sm:text-base">
                    {item.item_name}
                  </span>
                  <div className={`flex flex-col items-end gap-0 ${index === activeIndex ? 'text-primary-foreground' : 'text-primary'}`}>
                    <span className="text-[10px] font-black tracking-widest uppercase opacity-70">
                       Stocks
                    </span>
                    <span className="text-sm font-bold leading-tight">
                       {item.current_stock || 0}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <div className="absolute top-full left-0 z-10 w-full mb-4">
            <p className="mt-1 text-red-500 text-xs font-medium bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded border border-red-500/20 shadow-sm leading-tight">
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }
);

ItemAutocomplete.displayName = "ItemAutocomplete";

export default ItemAutocomplete;
