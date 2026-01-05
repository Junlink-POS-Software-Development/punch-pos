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
import { useCategories } from "@/app/inventory/hooks/useCategories";

interface CategorySelectProps {
  value?: string; // This expects the UUID now
  onChange: (value: string) => void; // Emits the UUID
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
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories();

  // --- LOCAL UI STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Find the currently selected category object based on the ID passed in 'value'
  const selectedCategory = categories.find(c => c.id === value);
  const selectedName = selectedCategory ? selectedCategory.category : "";

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
        // Revert search text to the selected name if the user didn't pick anything
        if (selectedName) setSearch(selectedName);
        else if (!value) setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedName, value]);

  // 2. Sync internal search text when the external value (ID) changes
  useEffect(() => {
    // If the dropdown is NOT open, ensure the text box matches the selected category name
    if (!isOpen && selectedName) {
      setSearch(selectedName);
    } else if (!isOpen && !value) {
      setSearch("");
    }
  }, [value, selectedName, isOpen]);

  // --- HANDLERS ---
  
  const handleSelect = (categoryId: string, categoryName: string) => {
    console.log("📝 [CategorySelect] handleSelect triggered", { categoryId, categoryName });
    onChange(categoryId); // Send UUID to parent
    setSearch(categoryName); // Show Name to user
    setIsOpen(false);
  };

  const handleCreate = async () => {
    console.log("📝 [CategorySelect] handleCreate triggered", { search });
    if (!search.trim()) return;
    try {
      setActionLoading(true);
      // addCategory now returns the created object
      const newCat = await addCategory(search); 
      
      if (newCat && newCat.id) {
        onChange(newCat.id); // Select the new ID
        setSearch(newCat.category);
      }
      setIsOpen(false);
    } catch (err) {
      console.error(err);
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
    console.log("📝 [CategorySelect] saveEdit triggered", { editingId, editValue });
    e.stopPropagation();
    if (!editingId || !editValue.trim()) return;
    try {
      setActionLoading(true);
      await updateCategory(editingId, editValue);
      
      setEditingId(null);
      
      // If we edited the currently selected item, update the search text
      if (value === editingId) {
        setSearch(editValue);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    console.log("📝 [CategorySelect] handleDelete triggered", { id });
    e.stopPropagation();
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      setActionLoading(true);
      
      // Check if we are deleting the currently selected item
      const isSelected = value === id;
      
      await deleteCategory(id); 
      
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
          value={search} // Always display the text name or search query
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            // Note: We DO NOT call onChange here because the parent expects an ID.
            // We only call onChange when a specific valid category is clicked or created.
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

      {error && <p className="mt-1 text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
          
          {filtered.map(cat => (
            <div 
              key={cat.id} 
              className="group flex items-center justify-between px-3 py-2 hover:bg-slate-800 cursor-pointer text-sm text-slate-300"
              onClick={() => handleSelect(cat.id, cat.category)} // Pass ID and Name
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
                    <button type="button" onClick={saveEdit} disabled={actionLoading} className="text-green-400 hover:text-green-300">
                        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3"/>}
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-red-400 hover:text-red-300">
                        <X className="w-3 h-3"/>
                    </button>
                </div>
              ) : (
                // --- View Mode ---
                <>
                  <span className={value === cat.id ? "text-cyan-400 font-bold" : ""}>
                    {cat.category}
                  </span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        type="button"
                        onClick={(e) => startEdit(e, cat)}
                        className="p-1 hover:bg-slate-700 rounded text-blue-400" 
                        title="Edit"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                        type="button"
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