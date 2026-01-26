"use client";

import React, { useState, useEffect, useRef, forwardRef } from "react";
import {
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Classification } from "../lib/expenses.api"; // Check this path matches your folder structure
import { useClassifications } from "@/app/expenses/hooks/useClassifications";

interface ClassificationSelectProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value?: string; // This will now receive the UUID
  onChange: (value: string) => void; // We will emit the UUID
  error?: string;
}

export const ClassificationSelect = forwardRef<
  HTMLInputElement,
  ClassificationSelectProps
>(
  (
    {
      value, // The ID (UUID)
      onChange,
      error,
      disabled,
      onKeyDown,
      onBlur,
      name,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Store state
    const {
      classifications,
      isLoading: loading,
      addClassification,
      editClassification,
      removeClassification,
    } = useClassifications();

    // UI state
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    
    // We track if the user is actively typing to avoid overwriting their text with the DB name
    const isTyping = useRef(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Keyboard navigation
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);

    const containerRef = useRef<HTMLDivElement>(null);

    // --- EFFECT 1: Sync External ID (value) -> Internal Text (search) ---
    useEffect(() => {
      // If we have a valid ID selected...
      if (value) {
        const match = classifications.find((c) => c.id === value);
        if (match) {
          // ...and we are not currently typing, update the display text to match the DB Name
          setSearch(match.name);
          isTyping.current = false;
        }
      } else if (!value && !isTyping.current) {
        // If ID is cleared externally (e.g. form reset), clear text
        setSearch("");
      }
    }, [value, classifications]);

    // --- EFFECT 2: Auto-Select ID based on Text (Smart Match) ---
    useEffect(() => {
        // If no ID is selected, but we have text (e.g. after creating "New Cat"),
        // try to find a matching name in the new list and auto-select its ID.
        if (!value && search.trim()) {
            const exactMatch = classifications.find(
                (c) => c.name.toLowerCase() === search.toLowerCase().trim()
            );
            if (exactMatch) {
                onChange(exactMatch.id);
                isTyping.current = false;
            }
        }
    }, [search, value, classifications, onChange]);


    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setEditingId(null);
          setHighlightIndex(-1);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Derived list
    const filtered = classifications.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim())
    );
    const exactMatch = filtered.some(
      (c) => c.name.toLowerCase() === search.toLowerCase().trim()
    );

    // Selection Handler
    const handleSelect = (cls: Classification) => {
      isTyping.current = false;
      setSearch(cls.name);
      onChange(cls.id); // <--- CRITICAL: Sending ID, not Name
      setIsOpen(false);
      setHighlightIndex(-1);
    };

    // Create Handler
    const handleCreate = async () => {
      const trimmed = search.trim();
      if (!trimmed) return;
      try {
        setActionLoading(true);
        await addClassification(trimmed);
        // We don't manually set ID here; Effect 2 will detect the new item and auto-select it.
        setIsOpen(false);
        setHighlightIndex(-1);
      } catch {
        alert("Failed to create classification");
      } finally {
        setActionLoading(false);
      }
    };

    // Edit Handlers
    const startEdit = (e: React.MouseEvent, cls: Classification) => {
      e.stopPropagation();
      setEditingId(cls.id);
      setEditValue(cls.name);
    };

    const saveEdit = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!editingId || !editValue.trim()) return;
      try {
        setActionLoading(true);
        await editClassification(editingId, editValue);
        setEditingId(null);
        // The list updates, Effect 1 runs, updates display text automatically.
      } catch {
        alert("Failed to update classification");
      } finally {
        setActionLoading(false);
      }
    };

    // Delete Handler
    const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!confirm("Are you sure? This cannot be undone.")) return;
      try {
        setActionLoading(true);
        await removeClassification(id);
        
        // If we deleted the currently selected item, clear the selection
        if (value === id) {
          onChange("");
          setSearch("");
          isTyping.current = false;
        }
      } catch {
        alert("Failed to delete classification");
      } finally {
        setActionLoading(false);
      }
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        {/* Input */}
        <div className="relative">
          <input
            ref={ref}
            type="text"
            name={name}
            value={search} // Controlled by 'search' (Name), not 'value' (ID)
            onBlur={(e) => {
                 // On blur, if we have an exact match typed out, enforce selection
                 const match = classifications.find(c => c.name.toLowerCase() === search.toLowerCase().trim());
                 if (match && value !== match.id) {
                     handleSelect(match);
                 }
                 if (onBlur) onBlur(e);
            }}
            onChange={(e) => {
              const next = e.target.value;
              isTyping.current = true;
              setSearch(next);
              
              // When typing, we don't have a valid ID yet, so clear it.
              // Effect 2 will auto-fill it if a match is found while typing.
              if (value) onChange(""); 
              
              if (!isOpen) setIsOpen(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => {
              setIsOpen(true);
              if (value) {
                 // Find index of current ID
                 const idx = filtered.findIndex((c) => c.id === value);
                 setHighlightIndex(idx >= 0 ? idx : -1);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIsOpen(true);
                setHighlightIndex((prev) =>
                  prev < filtered.length - 1 ? prev + 1 : filtered.length > 0 ? 0 : -1
                );
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightIndex((prev) =>
                  prev > 0 ? prev - 1 : filtered.length > 0 ? filtered.length - 1 : -1
                );
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (highlightIndex >= 0 && filtered[highlightIndex]) {
                  handleSelect(filtered[highlightIndex]);
                  if (onKeyDown) onKeyDown(e);
                } else if (!exactMatch && search.trim()) {
                    handleCreate(); // Allow Enter to create
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
            placeholder={placeholder || "Select or create classification..."}
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
              const next = !isOpen;
              setIsOpen(next);
              if (!next) setHighlightIndex(-1);
            }}
            tabIndex={-1}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="z-50 absolute bg-slate-900 shadow-xl mt-1 border border-slate-700 rounded-lg w-full max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
            {filtered.map((cls, idx) => (
              <div
                key={cls.id}
                className={`group flex items-center justify-between px-3 py-2 cursor-pointer text-sm ${
                  idx === highlightIndex
                    ? "bg-slate-700 text-cyan-400"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseLeave={() => setHighlightIndex(-1)}
                onClick={() => handleSelect(cls)}
              >
                {editingId === cls.id ? (
                  <div
                    className="flex items-center gap-2 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      className="bg-slate-950 px-2 py-1 border border-slate-600 rounded focus:outline-none w-full text-white text-xs"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                          if(e.key === 'Enter') saveEdit(e as any);
                      }}
                    />
                    <button
                      onClick={saveEdit}
                      disabled={actionLoading}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={value === cls.id ? "font-bold text-cyan-400" : ""}>
                      {cls.name}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEdit(e, cls)}
                        className="hover:bg-slate-700 p-1 rounded text-blue-400"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, cls.id)}
                        className="hover:bg-slate-700 p-1 rounded text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {!exactMatch && search.trim() !== "" && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={actionLoading}
                className="flex items-center gap-2 hover:bg-slate-800 px-3 py-2 border-slate-800 border-t w-full text-cyan-400 text-sm text-left"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create &quot;{search}&quot;
              </button>
            )}

            {filtered.length === 0 && search.trim() === "" && (
              <div className="px-3 py-4 text-slate-500 text-xs text-center">
                Start typing to add...
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ClassificationSelect.displayName = "ClassificationSelect";