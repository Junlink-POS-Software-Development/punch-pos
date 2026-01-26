"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { CategoryItem } from "../components/cashout/CashoutForm";

interface CategorySelectProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value?: string;
  onChange: (value: string) => void;
  options: CategoryItem[];
  error?: string;
  isLoading?: boolean;
}

export const CategorySelect = forwardRef<
  HTMLInputElement,
  CategorySelectProps
>(
  (
    {
      value,
      onChange,
      options,
      error,
      isLoading,
      disabled,
      onKeyDown,
      name,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync value with search text
    useEffect(() => {
      if (value) {
        const match = options.find((c) => c.category === value);
        if (match) {
          setSearch(match.category);
        }
      } else {
        setSearch("");
      }
    }, [value, options]);

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setHighlightIndex(-1);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = options.filter((c) =>
      c.category.toLowerCase().includes(search.toLowerCase().trim())
    );

    const handleSelect = (item: CategoryItem) => {
      setSearch(item.category);
      onChange(item.category);
      setIsOpen(false);
      setHighlightIndex(-1);
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        <div className="relative">
          <input
            ref={(e) => {
                // Handle both refs
                if (typeof ref === 'function') ref(e);
                else if (ref) ref.current = e;
                (inputRef as any).current = e;
            }}
            type="text"
            name={name}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
              setHighlightIndex(-1);
              // Clear value if user types something new until they select
              if (value) onChange(""); 
            }}
            onFocus={() => {
               // Do not auto-open on focus, wait for interaction or typing
               // But if user types, onChange triggers open.
            }}
            onClick={() => {
                if (!disabled) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    setHighlightIndex(0);
                    return;
                }
                setHighlightIndex((prev) =>
                  prev < filtered.length - 1 ? prev + 1 : filtered.length > 0 ? 0 : -1
                );
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                    setHighlightIndex(filtered.length - 1);
                    return;
                }
                setHighlightIndex((prev) =>
                  prev > 0 ? prev - 1 : filtered.length > 0 ? filtered.length - 1 : -1
                );
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                
                if (!isOpen) {
                    // 1. Enter when closed -> Open
                    setIsOpen(true);
                    // Optional: highlight first item or current item
                    const idx = filtered.findIndex(c => c.category === value);
                    setHighlightIndex(idx >= 0 ? idx : 0);
                    return;
                }

                // 2. Enter when open -> Select
                if (highlightIndex >= 0 && filtered[highlightIndex]) {
                  handleSelect(filtered[highlightIndex]);
                  // Propagate to parent to move focus
                  if (onKeyDown) onKeyDown(e);
                } else if (filtered.length === 1) {
                    // Auto-select if only one match
                    handleSelect(filtered[0]);
                    if (onKeyDown) onKeyDown(e);
                }
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
                setHighlightIndex(-1);
                return;
              }
              if (onKeyDown) onKeyDown(e);
            }}
            disabled={disabled}
            placeholder={placeholder || "Select source..."}
            className={`w-full input-dark pr-10 ${
              error ? "border-red-500" : ""
            }`}
            autoComplete="off"
            {...props}
          />

          <button
            type="button"
            className="top-1/2 right-2 absolute text-slate-400 -translate-y-1/2"
            onClick={() => {
              if (disabled) return;
              setIsOpen(!isOpen);
            }}
            tabIndex={-1}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {isOpen && !disabled && (
          <div className="z-50 absolute bg-slate-900 shadow-xl mt-1 border border-slate-700 rounded-lg w-full max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm ${
                  idx === highlightIndex
                    ? "bg-slate-700 text-cyan-400"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => {
                    handleSelect(item);
                    // We can't easily propagate Enter key here for focus move
                    // But usually mouse click doesn't need to move focus automatically 
                    // or user will click next field.
                    // If we want to move focus, we'd need a ref to next field passed here, 
                    // but that's handled by parent's onKeyDown usually.
                }}
              >
                <span className={value === item.category ? "font-bold text-cyan-400" : ""}>
                  {item.category}
                </span>
                {value === item.category && <Check className="w-4 h-4" />}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="px-3 py-4 text-slate-500 text-xs text-center">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

CategorySelect.displayName = "CategorySelect";
