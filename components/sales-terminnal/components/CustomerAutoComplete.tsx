"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { User, Users, Search, X, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PosRegisterCustomerModal } from "../modals/PosRegisterCustomerModal";
import { Customer } from "@/app/customers/lib/types";

export type CustomerResult = {
  id: string;
  full_name: string;
  group_name?: string;
  phone_number?: string;
};

interface CustomerSearchRow {
  id: string;
  full_name: string;
  phone_number: string | null;
  customer_groups: {
    name: string;
  } | null;
}

export interface CustomerAutoCompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onCustomerSelect: (customer: CustomerResult) => void;
  onClear: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isTabletMode?: boolean;
  error?: string;
  isCustomerSelected?: boolean;
}

export const CustomerAutoComplete = forwardRef<HTMLInputElement, CustomerAutoCompleteProps>(
  (
    {
      id = "customerName",
      value,
      onChange,
      onCustomerSelect,
      onClear,
      onKeyDown,
      onFocus,
      onBlur,
      placeholder = "Search customer...",
      className,
      disabled = false,
      isTabletMode = false,
      error,
      isCustomerSelected = false,
    },
    ref
  ) => {
    const internalInputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<CustomerResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [registerInitialName, setRegisterInitialName] = useState("");

    const supabase = createClient();

    // Close dropdown on click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search when value changes or when opened
    useEffect(() => {
      if (!isOpen) return;

      const trimmed = (value || "").trim();
      const delayDebounceFn = setTimeout(async () => {
        setIsLoading(true);
        try {
          let query = supabase
            .from("customers")
            .select(
              `
              id,
              full_name,
              phone_number,
              customer_groups ( name )
            `
            )
            .order("full_name", { ascending: true })
            .limit(8);

          if (trimmed) {
            query = query.or(`full_name.ilike.%${trimmed}%,phone_number.ilike.%${trimmed}%`);
          }

          const { data, error: qError } = await query;
          if (qError) throw qError;

          const rows = (data || []) as unknown as CustomerSearchRow[];
          const mapped: CustomerResult[] = rows.map((c) => ({
            id: c.id,
            full_name: c.full_name,
            phone_number: c.phone_number ?? undefined,
            group_name: c.customer_groups?.name,
          }));

          setResults(mapped);
          setHighlightedIndex(mapped.length > 0 ? 0 : -1);
        } catch (err) {
          console.error("Customer search error:", err);
        } finally {
          setIsLoading(false);
        }
      }, 250);

      return () => clearTimeout(delayDebounceFn);
    }, [value, isOpen, supabase]);

    // Scroll highlighted item into view
    useEffect(() => {
      if (listRef.current && highlightedIndex >= 0) {
        const el = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
        el?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex]);

    const handleSelect = (customer: CustomerResult) => {
      onCustomerSelect(customer);
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    const handleOpenRegister = () => {
      setRegisterInitialName(value.trim());
      setIsOpen(false);
      setIsRegisterModalOpen(true);
    };

    const handleRegisterSuccess = (newCustomer: Customer) => {
      const selected: CustomerResult = {
        id: newCustomer.id,
        full_name: newCustomer.full_name,
        phone_number: newCustomer.phone_number || undefined,
        group_name: newCustomer.group?.name,
      };
      onCustomerSelect(selected);
      setIsRegisterModalOpen(false);
      setIsOpen(false);
    };

    // Total selectable items count: results + register button (if search term entered or results exist)
    const canShowRegisterButton = true;
    const registerButtonIndex = results.length; // index right after last result

    const handleInternalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        if (isOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(false);
          return;
        }
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        const maxIndex = canShowRegisterButton ? results.length : results.length - 1;
        setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        const maxIndex = canShowRegisterButton ? results.length : results.length - 1;
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
        return;
      }

      if (e.key === "Enter") {
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < results.length) {
            e.preventDefault();
            handleSelect(results[highlightedIndex]);
            return;
          } else if (highlightedIndex === registerButtonIndex) {
            e.preventDefault();
            handleOpenRegister();
            return;
          }
        }
        // If not selecting a dropdown item, let parent handle Enter (e.g. advance to barcode)
        setIsOpen(false);
        onKeyDown?.(e);
        return;
      }

      onKeyDown?.(e);
    };

    return (
      <div ref={containerRef} className="relative w-full">
        {/* Input Container */}
        <div className="relative flex items-center w-full">
          {/* Left Icon */}
          <div className="absolute left-2.5 text-muted-foreground pointer-events-none flex items-center">
            {isCustomerSelected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <User className="w-3.5 h-3.5" />
            )}
          </div>

          <input
            ref={internalInputRef}
            id={id}
            type="text"
            autoComplete="off"
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={(e) => {
              setIsOpen(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              onBlur?.(e);
            }}
            onKeyDown={handleInternalKeyDown}
            inputMode={isTabletMode ? "none" : undefined}
            className={`w-full h-8.5 sm:h-9.5 text-xs sm:text-sm bg-background text-foreground pl-8 pr-7 rounded-lg border transition-colors outline-none ${
              error
                ? "border-destructive focus:border-destructive"
                : isCustomerSelected
                ? "border-emerald-500/60 focus:border-emerald-500"
                : "border-input focus:border-primary"
            } ${className || ""}`}
          />

          {/* Right Action Icons (Clear / Loading) */}
          <div className="absolute right-2 flex items-center gap-1">
            {isLoading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
            {value ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                  internalInputRef.current?.focus();
                }}
                className="p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                title="Clear Customer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <ul
            ref={listRef}
            className="absolute z-50 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-card border border-border rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 backdrop-blur-md"
          >
            {isLoading && results.length === 0 ? (
              <li className="flex items-center justify-center py-6 text-muted-foreground text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Searching registered customers...</span>
              </li>
            ) : results.length > 0 ? (
              <>
                {results.map((customer, index) => {
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <li
                      key={customer.id}
                      data-index={index}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur before select
                        handleSelect(customer);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                        isHighlighted
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            isHighlighted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <User className="w-3 h-3" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold truncate">{customer.full_name}</p>
                          {customer.phone_number && (
                            <p className="text-[10px] text-muted-foreground truncate">{customer.phone_number}</p>
                          )}
                        </div>
                      </div>

                      {customer.group_name && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border ml-2 flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" />
                          {customer.group_name}
                        </span>
                      )}
                    </li>
                  );
                })}

                {/* Option to register new customer at bottom */}
                <li
                  data-index={registerButtonIndex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleOpenRegister();
                  }}
                  onMouseEnter={() => setHighlightedIndex(registerButtonIndex)}
                  className={`mt-1 pt-1 border-t border-border flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs font-semibold ${
                    highlightedIndex === registerButtonIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 hover:bg-muted text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register New Customer</span>
                  </div>
                  <span className="text-[10px] opacity-80 uppercase tracking-wider">
                    + Add Form
                  </span>
                </li>
              </>
            ) : (
              /* No matching customer found */
              <div className="p-3 text-center flex flex-col items-center gap-2.5">
                <p className="text-xs text-muted-foreground">
                  {value.trim() ? (
                    <>
                      No registered customer found for{" "}
                      <span className="font-semibold text-foreground">"{value.trim()}"</span>
                    </>
                  ) : (
                    "No registered customers yet"
                  )}
                </p>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleOpenRegister();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Customer</span>
                </button>
              </div>
            )}
          </ul>
        )}

        {/* Customer Registration Modal */}
        <PosRegisterCustomerModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={handleRegisterSuccess}
          initialName={registerInitialName}
        />
      </div>
    );
  }
);

CustomerAutoComplete.displayName = "CustomerAutoComplete";
