// ItemAutocomplete.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef, forwardRef } from "react";
import { useItems } from "@/app/inventory/components/item-registration/context/ItemsContext";
import { Item } from "@/app/inventory/components/item-registration/utils/itemTypes";

export interface ItemAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  error?: string;
  onItemSelect?: (item: Item) => void;
  className?: string;
}

const ItemAutocomplete = forwardRef<HTMLInputElement, ItemAutocompleteProps>(
  (
    { className, value, onChange, onBlur, disabled, error, onItemSelect },
    ref
  ) => {
    const { items } = useItems();
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    const suggestions = useMemo(() => {
      if (!value) return [];
      return items
        .filter((item) =>
          item.itemName.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 10);
    }, [items, value]);

    const handleSelect = (item: Item) => {
      // NOTE: We pass item.sku back to the form (via onChange) for the barcode field,
      // but we use item.itemName for the visual display in the input.
      // Since this component is used for the `barcode` field (which is tied to SKU),
      // we need to pass the SKU as the value to the parent form.
      // However, looking at FormFields.tsx:
      // - The input is bound to `barcode` (an SKU).
      // - The ItemAutocomplete onChange is used for the text input (likely item name or partial SKU).
      // - The onItemSelect is used to set the final SKU via setValue("barcode", item.sku).
      //
      // To maintain the original behavior of this file, we will keep onChange(item.itemName)
      // but ensure onItemSelect handles the form value update.
      onChange(item.itemName);
      setIsOpen(false);
      setActiveIndex(-1);
      if (onItemSelect) {
        onItemSelect(item);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (suggestions.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        setIsOpen(true);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (suggestions.length === 0) return;
        setActiveIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
        setIsOpen(true);
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          // Case 1: An item is highlighted/selected from the dropdown.
          e.preventDefault();
          handleSelect(suggestions[activeIndex]);
        } else {
          // Case 2: User pressed Enter on the text input without selecting a suggestion.
          // We DO NOT call e.preventDefault() here.
          // This allows the event to bubble up to FormFields.tsx's handleKeyDown,
          // which will move focus to 'quantity'. The parent component will handle
          // the form submission prevention.
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
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
          id="itemName"
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
          onFocus={() => {
            if (value && suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`${className} ${
            disabled ? "opacity-50 cursor-not-allowed text-slate-500" : ""
          } ${error ? "border-red-500" : ""}`}
          placeholder="e.g., 'Product A'"
          autoComplete="off"
        />
        {isOpen && suggestions.length > 0 && (
          <ul
            ref={listRef}
            className="z-10 absolute bg-slate-800 shadow-lg mt-1 border border-slate-700 rounded-md w-full max-h-60 overflow-y-auto"
          >
            {suggestions.map((item, index) => (
              <li
                key={item.id}
                className={`px-3 py-2 cursor-pointer ${
                  index === activeIndex
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-700"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
              >
                {item.itemName}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="mt-1 text-red-300 text-sm">{error}</p>}
      </div>
    );
  }
);

ItemAutocomplete.displayName = "ItemAutocomplete";

export default ItemAutocomplete;
