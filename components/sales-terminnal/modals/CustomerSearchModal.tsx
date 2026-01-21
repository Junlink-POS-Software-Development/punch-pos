"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, Users, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export type CustomerResult = {
  id: string;
  full_name: string;
  group_name?: string;
  phone_number?: string;
};

// [NEW] Define the expected shape from the database query
interface CustomerSearchRow {
  id: string;
  full_name: string;
  phone_number: string | null;
  customer_groups: {
    name: string;
  } | null; // Supabase returns an object for Many-to-One relations
}

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: CustomerResult) => void;
}

export const CustomerSearchModal = ({
  isOpen,
  onClose,
  onSelect,
}: CustomerSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Focus input when opened & reset state
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setResults([]);
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [results]);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("customers")
          .select(
            `
            id, 
            full_name, 
            phone_number,
            customer_groups ( name )
          `
          )
          .ilike("full_name", `%${searchTerm}%`)
          .limit(10);

        if (error) throw error;

        const rows = (data || []) as unknown as CustomerSearchRow[];

        const mapped = rows.map((c) => ({
          id: c.id,
          full_name: c.full_name,
          phone_number: c.phone_number ?? undefined,
          group_name: c.customer_groups?.name,
        }));

        setResults(mapped);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, supabase]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : results.length - 1
      );
    } else if (e.key === "Enter" && results[highlightedIndex]) {
      e.preventDefault();
      onSelect(results[highlightedIndex]);
      onClose();
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && results.length > 0) {
      const highlightedEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      highlightedEl?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, results.length]);

  if (!isOpen) return null;

  return (
    <div className="z-[60] fixed inset-0 flex justify-center items-start bg-black/60 backdrop-blur-sm pt-20 animate-in duration-200 fade-in">
      <div className="bg-slate-900 shadow-2xl border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden glass-effect">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-slate-700/50 border-b">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search customer by name..."
            className="flex-1 bg-transparent border-none outline-none font-medium text-white placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="p-2 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8 text-cyan-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              {results.map((customer, index) => (
                <button
                  key={customer.id}
                  data-index={index}
                  onClick={() => {
                    onSelect(customer);
                    onClose();
                  }}
                  className={`group flex justify-between items-center p-3 border rounded-lg text-left transition-all ${
                    index === highlightedIndex
                      ? "bg-slate-800/80 border-cyan-500/30"
                      : "border-transparent hover:bg-slate-800/80 hover:border-cyan-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex justify-center items-center rounded-full w-8 h-8 ${
                      index === highlightedIndex
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "bg-slate-800 text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400"
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${
                        index === highlightedIndex
                          ? "text-cyan-200"
                          : "text-white group-hover:text-cyan-200"
                      }`}>
                        {customer.full_name}
                      </p>
                      {customer.phone_number && (
                        <p className="text-slate-500 text-xs">
                          {customer.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                  {customer.group_name && (
                    <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 border border-slate-700 rounded text-[10px] text-slate-400">
                      <Users className="w-3 h-3" />
                      {customer.group_name}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="py-8 text-slate-500 text-sm text-center">
              No customers found.
            </div>
          ) : (
            <div className="py-8 text-slate-500 text-sm text-center">
              Type to search for registered customers...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center bg-slate-950/30 px-4 py-2 border-slate-800 border-t text-[10px] text-slate-500">
          <span className="flex items-center gap-2">
            <kbd className="bg-slate-800 px-1 border border-slate-700 rounded">↑</kbd>
            <kbd className="bg-slate-800 px-1 border border-slate-700 rounded">↓</kbd>
            to navigate
            <kbd className="bg-slate-800 px-1 border border-slate-700 rounded ml-2">Enter</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-slate-800 px-1 border border-slate-700 rounded">
              Esc
            </kbd>{" "}
            to close
          </span>
        </div>
      </div>
    </div>
  );
};
