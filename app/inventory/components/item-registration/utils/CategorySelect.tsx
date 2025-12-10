// app/inventory/components/item-registration/components/CategorySelect.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronDown, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  AlertCircle
} from "lucide-react";

import { Category } from "../lib/categories.api";
import { useCategoryStore } from "../store/useCategoryStore";

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  error,
  disabled
}) => {
  // --- STORE ACCESS ---
  const { 
    categories, 
    isLoading: storeLoading, 
    loadCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategoryStore();

  // --- LOCAL UI STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [actionLoading, setActionLoading] = useState(false); // For inline actions

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load (Idempotent via store)
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // 2. Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Sync internal search with external value
  useEffect(() => {
    // Only update search if it's empty or we are not actively typing/searching
    // checking !isOpen prevents overwriting user's typing if the parent value changes unexpectedly
    if (value && !isOpen) {
      setSearch(value);
    }
  }, [value, isOpen]);

  // --- HANDLERS ---
  
  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setSearch(categoryName);
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!search.trim()) return;
    try {
      setActionLoading(true);
      await addCategory(search); // Store action
      
      // Store updates automatically, no need to reload
      onChange(search); 
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      // Error is handled in store, but we can show a toast here if needed
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setEditingId(cat.id);
    setEditValue(cat.category);
  };

  const saveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingId || !editValue.trim()) return;
    try {
      setActionLoading(true);
      await updateCategory(editingId, editValue); // Store action
      
      setEditingId(null);
      // Update selected value if we just edited the currently selected one
      const wasSelected = categories.find(c => c.id === editingId)?.category === value;
      if (wasSelected) {
        onChange(editValue);
        setSearch(editValue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      setActionLoading(true);
      
      // Check if we are deleting the currently selected item
      const isSelected = categories.find(c => c.id === id)?.category === value;
      
      await deleteCategory(id); // Store action
      
      if (isSelected) {
        onChange(""); 
        setSearch("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Logic
  const filtered = categories.filter(c => 
    c.category.toLowerCase().includes(search.toLowerCase())
  );
  const exactMatch = filtered.some(c => c.category.toLowerCase() === search.toLowerCase());

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            // Only fire onChange if it matches an existing category, 
            // OR if you want free-text input. Usually select inputs require a match.
            // Keeping your original logic of "onChange(e.target.value)":
            onChange(e.target.value); 
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled || storeLoading}
          placeholder={storeLoading ? "Loading..." : "Select or create category..."}
          className={`w-full input-dark pr-10 ${error ? "border-red-500" : ""}`}
        />
        <button 
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
        >
          {storeLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Error Message from Store or Props */}
      {error && <p className="mt-1 text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</p>}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
          
          {/* List Items */}
          {filtered.map(cat => (
            <div 
              key={cat.id} 
              className="group flex items-center justify-between px-3 py-2 hover:bg-slate-800 cursor-pointer text-sm text-slate-300"
              onClick={() => handleSelect(cat.category)}
            >
              {editingId === cat.id ? (
                // --- Edit Mode ---
                <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                    <input 
                        className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs w-full text-white focus:outline-none"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                    />
                    <button onClick={saveEdit} disabled={actionLoading} className="text-green-400 hover:text-green-300">
                        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-red-400 hover:text-red-300">
                        <X className="w-3 h-3"/>
                    </button>
                </div>
              ) : (
                // --- View Mode ---
                <>
                  <span className={value === cat.category ? "text-cyan-400 font-bold" : ""}>
                    {cat.category}
                  </span>
                  
                  {/* Actions (visible on hover) */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => startEdit(e, cat)}
                        className="p-1 hover:bg-slate-700 rounded text-blue-400" 
                        title="Edit"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                        onClick={(e) => handleDelete(e, cat.id)}
                        className="p-1 hover:bg-slate-700 rounded text-red-400" 
                        title="Delete"
                    >
                       {actionLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Create Option */}
          {!exactMatch && search.trim() !== "" && (
             <button
               type="button"
               onClick={handleCreate}
               disabled={actionLoading}
               className="w-full text-left px-3 py-2 text-sm text-cyan-400 hover:bg-slate-800 border-t border-slate-800 flex items-center gap-2"
             >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4" />}
                Create "{search}"
             </button>
          )}

          {filtered.length === 0 && search.trim() === "" && (
            <div className="px-3 py-4 text-center text-xs text-slate-500">
                Start typing to add...
            </div>
          )}
        </div>
      )}
    </div>
  );
};