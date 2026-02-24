"use client";

import React, { useState } from "react";
import { X, Plus, Edit2, Trash2, Check, Loader2, AlertCircle } from "lucide-react";
import { useCategories } from "@/app/inventory/hooks/useCategories";
import { Category } from "../lib/categories.api";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    isProcessing,
  } = useCategories();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = categories.some(
    (c) => c.category.toLowerCase() === newCatName.trim().toLowerCase()
  );

  const handleAdd = async () => {
    if (!newCatName.trim() || exactMatch) return;
    try {
      setLocalLoading(true);
      setLocalError(null);
      await addCategory(newCatName.trim());
      setNewCatName("");
    } catch (err: any) {
      setLocalError(err.message || "Failed to add category");
    } finally {
      setLocalLoading(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditValue(cat.category);
    setLocalError(null);
  };

  const saveEdit = async () => {
    if (!editingId || !editValue.trim()) return;
    try {
      setLocalLoading(true);
      setLocalError(null);
      await updateCategory(editingId, editValue.trim());
      setEditingId(null);
    } catch (err: any) {
      setLocalError(err.message || "Failed to update category");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" category? This cannot be undone.`)) return;
    try {
      setLocalLoading(true);
      setLocalError(null);
      await deleteCategory(id);
    } catch (err: any) {
      setLocalError(err.message || "Failed to delete category (it may be in use).");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">Manage Categories</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            disabled={isProcessing || localLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 overflow-hidden flex-1">
          
          {/* Add New Category */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New Category Name..."
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                setLocalError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
            />
            <button
              onClick={handleAdd}
              disabled={!newCatName.trim() || exactMatch || isProcessing || localLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(isProcessing || localLoading) && !editingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </button>
          </div>
          {exactMatch && <p className="text-xs text-orange-400">Category already exists.</p>}

          {/* Search/Filter existing */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search existing categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            />
          </div>

          {(error || localError) && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{localError || error}</p>
            </div>
          )}

          {/* Category List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar border border-border rounded-lg bg-background/50">
            {isLoading ? (
              <div className="flex justify-center items-center h-32 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex justify-center items-center h-32 text-muted-foreground text-sm">
                No categories found.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredCategories.map((cat) => (
                  <li key={cat.id} className="flex items-center justify-between p-3 hover:bg-muted/30 group">
                    {editingId === cat.id ? (
                      // Edit Mode
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-background border border-primary/50 rounded px-2 py-1.5 text-sm text-foreground focus:outline-none"
                        />
                        <button
                          onClick={saveEdit}
                          disabled={isProcessing || localLoading || !editValue.trim()}
                          className="p-1.5 text-green-500 hover:bg-green-500/10 rounded transition-colors disabled:opacity-50"
                        >
                          {(isProcessing || localLoading) && editingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={isProcessing || localLoading}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <span className="text-sm font-medium text-foreground">{cat.category}</span>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                          <button
                            onClick={() => startEdit(cat)}
                            className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.category)}
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
