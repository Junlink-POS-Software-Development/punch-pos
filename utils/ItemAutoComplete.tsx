"use client";

import React, { useState, useMemo, useEffect, useRef, forwardRef } from "react";
import { useInventory } from "@/app/dashboard/hooks/useInventory";
import { InventoryItem } from "@/app/inventory/components/stocks-monitor/lib/inventory.api";
import { extractPharmacyMeta } from "@/lib/utils/pharmacyMeta";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import { ChevronDown } from "lucide-react";

export interface ItemAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  error?: string;
  onItemSelect?: (item: InventoryItem) => void;
  className?: string;
  id?: string;
  placeholder?: string;
  // 1. FIX: Add onKeyDown to the interface
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  disableDropdown?: boolean;
  showChevron?: boolean;
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
      placeholder,
      onKeyDown, // 2. FIX: Destructure onKeyDown from props
      onFocus,
      inputMode,
      disableDropdown = false,
      showChevron = false,
    },
    ref
  ) => {
    const { inventory: items } = useInventory();
    const { isPharmacy } = useBusinessMode();
    const shouldDisableDropdown = Boolean(disableDropdown);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    const suggestions = useMemo(() => {
      if (!items || items.length === 0) return [];
      const query = value ? value.toLowerCase().trim() : "";
      
      const mapped = items.map((item) => {
        const meta = extractPharmacyMeta(item);
        return {
          ...item,
          generic_name: meta.genericName || item.generic_name,
          dosage: meta.dosage || item.dosage,
          formulation: meta.formulation || item.formulation,
          is_rx: meta.isRx !== undefined ? meta.isRx : item.is_rx,
          brand_type: meta.brandType || item.brand_type,
        };
      });

      if (!query) {
        return mapped.slice(0, 20);
      }

      return mapped
        .filter((item) => {
          const nameMatch = item.item_name?.toLowerCase().includes(query);
          const skuMatch = item.sku?.toLowerCase().includes(query);
          const genericMatch = item.generic_name ? item.generic_name.toLowerCase().includes(query) : false;
          const dosageMatch = item.dosage ? item.dosage.toLowerCase().includes(query) : false;
          const formulationMatch = item.formulation ? item.formulation.toLowerCase().includes(query) : false;
          const descMatch = item.description ? item.description.toLowerCase().includes(query) : false;
          return nameMatch || skuMatch || genericMatch || dosageMatch || formulationMatch || descMatch;
        })
        .slice(0, 20);
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

    const handleInternalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (shouldDisableDropdown) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          window.dispatchEvent(
            new CustomEvent("pharmacy-search-nav", { detail: { key: e.key } })
          );
          window.dispatchEvent(
            new CustomEvent("retail-search-nav", { detail: { key: e.key } })
          );
          window.dispatchEvent(
            new CustomEvent("terminal-search-nav", { detail: { key: e.key } })
          );
          return;
        }
        if (e.key === "Enter") {
          const pharmEvent = new CustomEvent("pharmacy-search-nav", {
            detail: { key: "Enter" },
            cancelable: true,
          });
          window.dispatchEvent(pharmEvent);

          const retailEvent = new CustomEvent("retail-search-nav", {
            detail: { key: "Enter" },
            cancelable: true,
          });
          window.dispatchEvent(retailEvent);

          const terminalEvent = new CustomEvent("terminal-search-nav", {
            detail: { key: "Enter" },
            cancelable: true,
          });
          window.dispatchEvent(terminalEvent);

          if (
            pharmEvent.defaultPrevented ||
            retailEvent.defaultPrevented ||
            terminalEvent.defaultPrevented
          ) {
            e.preventDefault();
            return;
          }
        }
        if (onKeyDown) onKeyDown(e);
        return;
      }

      if (!isOpen || suggestions.length === 0) {
        if (onKeyDown) onKeyDown(e);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          e.preventDefault();
          handleSelect(suggestions[activeIndex]);
        } else {
          setIsOpen(false);
          if (onKeyDown) onKeyDown(e);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
      } else {
        if (onKeyDown) onKeyDown(e);
      }
    };

    const defaultPlaceholder = isPharmacy
      ? "Scan barcode, search brand, generic molecule, or dosage..."
      : "Scan barcode or search item...";

    // Handle clicks outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          innerRef.current &&
          !innerRef.current.contains(event.target as Node) &&
          listRef.current &&
          !listRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const innerRef = useRef<HTMLInputElement>(null);

    // Sync forwarded ref with local ref
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(innerRef.current);
      } else {
        (ref as any).current = innerRef.current;
      }
    }, [ref]);

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

    // Open dropdown when value changes programmatically (e.g. via virtual keyboard)
    useEffect(() => {
      if (value && document.activeElement === innerRef.current && suggestions.length > 0 && !shouldDisableDropdown) {
        setIsOpen(true);
      }
    }, [value, suggestions.length, shouldDisableDropdown]);

    return (
      <div className="relative w-full">
        <input
          ref={innerRef}
          id={id || "itemName"}
          type="text"
          value={value}
          placeholder={placeholder || defaultPlaceholder}
          onChange={(e) => {
            onChange(e.target.value);
            if (!shouldDisableDropdown) {
              setIsOpen(true);
              setActiveIndex(-1);
            }
          }}
          onBlur={() => {
            onBlur();
            setTimeout(() => setIsOpen(false), 250);
          }}
          onFocus={(e) => {
            if (onFocus) onFocus(e);
            if (!shouldDisableDropdown && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onClick={() => {
            if (!shouldDisableDropdown && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleInternalKeyDown} // Use our wrapper function
          disabled={disabled}
          inputMode={inputMode}
          className={`${className} ${!shouldDisableDropdown && showChevron && !disabled ? "pr-8" : ""} ${
            disabled ? "opacity-50 cursor-not-allowed text-slate-500" : ""
          } ${error ? "border-red-500" : ""}`}
          autoComplete="off"
        />
        {!shouldDisableDropdown && showChevron && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen((prev) => !prev);
              innerRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus:outline-none"
            aria-label="Toggle item list"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
          </button>
        )}
        {!shouldDisableDropdown && isOpen && suggestions.length > 0 && (
          <ul
            ref={listRef}
            className="z-50 absolute top-full left-0 bg-card/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.3)] mt-2 border border-border/50 rounded-xl w-full max-h-72 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {!value && items.length > 0 && (
              <li className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 select-none bg-muted/20">
                Available Items ({items.length})
              </li>
            )}
            {suggestions.map((item, index) => (
              <li
                key={item.item_id}
                className={`px-4 py-2.5 cursor-pointer transition-all duration-150 flex flex-col gap-1.5 ${
                  index === activeIndex
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.005] z-10 mx-1 rounded-xl"
                    : "text-foreground hover:bg-muted/80"
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
              >
                {/* Top Row: Name, Brand/Generic Badge, Rx, Price, Stocks */}
                <div className="flex justify-between items-center w-full gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                    <span className="font-bold tracking-tight text-sm sm:text-base truncate">
                      {item.item_name}
                    </span>
                    {item.brand_type && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase ${
                        item.brand_type === 'generic'
                          ? (index === activeIndex ? 'bg-white text-emerald-800 font-black' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30')
                          : (index === activeIndex ? 'bg-white text-blue-800 font-black' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30')
                      }`}>
                        {item.brand_type === 'generic' ? '💊 Generic' : '🏷️ Branded'}
                      </span>
                    )}
                    {item.is_rx && (
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider ${
                        index === activeIndex
                          ? 'bg-red-500 text-white'
                          : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                      }`}>
                        Rx
                      </span>
                    )}
                  </div>

                  {/* Right side: Price & Stock */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-mono font-bold text-sm ${index === activeIndex ? 'text-primary-foreground' : 'text-primary font-black'}`}>
                      ₱{(item.sales_price || 0).toFixed(2)}
                    </span>
                    <div className={`flex flex-col items-end shrink-0 ${index === activeIndex ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      <span className="text-[9px] font-bold tracking-wider uppercase opacity-75">
                        Stocks
                      </span>
                      <span className="text-xs font-bold font-mono leading-none">
                        {item.current_stock || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Generic Molecule, Dosage Chip, Formulation/Form Chip */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {item.generic_name && (
                    <span className={`truncate ${index === activeIndex ? 'text-primary-foreground/90 font-medium' : 'text-muted-foreground'}`}>
                      <span className="opacity-75 font-normal">Molecule:</span> <strong className="font-semibold">{item.generic_name}</strong>
                    </span>
                  )}

                  {/* Highlighted Dosage Badge */}
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                    index === activeIndex
                      ? 'bg-white/20 text-white border border-white/30'
                      : item.dosage
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        : 'bg-muted/50 text-muted-foreground border border-border/50 opacity-60'
                  }`}>
                    <span>Dosage:</span> {item.dosage || "—"}
                  </span>

                  {/* Highlighted Form / Formulation Badge */}
                  {item.formulation && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold flex items-center gap-0.5 ${
                      index === activeIndex
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                    }`}>
                      <span>Form:</span> {item.formulation}
                    </span>
                  )}

                  {/* Fallback to SKU if no molecule, dosage, or formulation */}
                  {!(item.generic_name || item.dosage || item.formulation) && (
                    <span className={`text-[11px] font-mono ${index === activeIndex ? 'text-primary-foreground/75' : 'text-muted-foreground/75'}`}>
                      SKU: {item.sku}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!shouldDisableDropdown && isOpen && Boolean(value && value.trim()) && suggestions.length === 0 && (
          <div className="z-50 absolute top-full left-0 bg-card/95 backdrop-blur-md shadow-xl mt-2 border border-border/50 rounded-xl w-full p-3 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-150">
            No inventory items matching &ldquo;<span className="font-semibold text-foreground">{value}</span>&rdquo;.
          </div>
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
