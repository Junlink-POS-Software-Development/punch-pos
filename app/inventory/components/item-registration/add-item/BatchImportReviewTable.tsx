"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AlertCircle, CheckCircle2, ChevronLeft, Save, Loader2, AlertTriangle, Trash2, X, Pencil } from "lucide-react";
import { Item } from "../utils/itemTypes";

// Define strict types for the batch import items
export interface BatchItem extends Omit<Item, "id"> {
    tempId: string; // For keying in the list
    initialStock: number;
    errors: { [key: string]: string }; // Field-specific error messages
}

interface BatchImportReviewTableProps {
  initialItems: BatchItem[];
  onBack: () => void;
  onSubmit: (items: BatchItem[]) => void;
  isProcessing: boolean;
}

export const BatchImportReviewTable: React.FC<BatchImportReviewTableProps> = ({
  initialItems,
  onBack,
  onSubmit,
  isProcessing,
}) => {
  const [items, setItems] = useState<BatchItem[]>(initialItems);
  const [filterErrorOnly, setFilterErrorOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalItem, setOriginalItem] = useState<BatchItem | null>(null);

  // Validate an item row
  const validateItem = (item: BatchItem): BatchItem => {
    const errors: { [key: string]: string } = {};

    if (!item.itemName?.trim()) errors.itemName = "Name required";
    if (!item.category?.trim()) errors.category = "Category required";
    
    // Numeric checks
    const sellPrice = Number(item.sellingPrice);
    if (isNaN(sellPrice) || sellPrice < 0) errors.sellingPrice = "Invalid Price";

    const costPrice = Number(item.salesPrice);
    if (isNaN(costPrice) || costPrice < 0) errors.salesPrice = "Invalid Cost";

    const stock = Number(item.initialStock);
    if (isNaN(stock) || stock < 0) errors.initialStock = "Invalid Stock";

    if (item.lowStockThreshold !== null && item.lowStockThreshold !== undefined) {
        const lowStock = Number(item.lowStockThreshold);
        if (isNaN(lowStock) || lowStock < 0) {
             errors.lowStockThreshold = "Invalid Min Stock";
        }
    }

    return { ...item, errors };
  };

  const startEditing = (item: BatchItem) => {
    setEditingId(item.tempId);
    setOriginalItem({ ...item });
  };

  const cancelEditing = () => {
    if (editingId && originalItem) {
      setItems((prev) =>
        prev.map((item) => (item.tempId === editingId ? originalItem : item))
      );
    }
    setEditingId(null);
    setOriginalItem(null);
  };

  const doneEditing = () => {
    setEditingId(null);
    setOriginalItem(null);
  };

  // Run validation on mount
  useEffect(() => {
     setItems(prevItems => prevItems.map(validateItem));
  }, []);

  const handleUpdateItem = (id: string, field: keyof BatchItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.tempId === id) {
          const updated = { ...item, [field]: value };
          return validateItem(updated); // Re-validate immediately
        }
        return item;
      })
    );
  };
  
  const handleDeleteItem = (id: string) => {
      setItems(prev => prev.filter(i => i.tempId !== id));
      if (editingId === id) {
        setEditingId(null);
        setOriginalItem(null);
      }
  };


  // Derived state
  const totalItems = items.length;
  const invalidItemsCount = items.filter((i) => Object.keys(i.errors).length > 0).length;
  const isValid = invalidItemsCount === 0 && totalItems > 0;

  // Sorting: Errors on top (unless editing, keep the editing row where it is to avoid jumpiness?)
  // Actually, sorting and editing can be tricky. Let's sort, but if editingId matches, maybe we pulse it.
  const sortedItems = useMemo(() => {
    let result = [...items];
    result.sort((a, b) => {
        const aHasError = Object.keys(a.errors).length > 0;
        const bHasError = Object.keys(b.errors).length > 0;
        if (aHasError && !bHasError) return -1;
        if (!aHasError && bHasError) return 1;
        return 0;
    });
    
    if (filterErrorOnly) {
        return result.filter(i => Object.keys(i.errors).length > 0);
    }
    return result;

  }, [items, filterErrorOnly]);


  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div>
           <h2 className="font-semibold text-foreground text-xl flex items-center gap-2">
            Review Batch Data
            {invalidItemsCount > 0 && (
                <span className="text-sm font-normal text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                    {invalidItemsCount} Issues Found
                </span>
            )}
           </h2>
           <p className="text-muted-foreground text-sm mt-1">
             Review and edit your data before importing. Rows with errors are highlighted.
           </p>
        </div>
        <div className="flex gap-2">
             <button
               onClick={() => setFilterErrorOnly(!filterErrorOnly)}
               className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                   filterErrorOnly 
                   ? "bg-destructive/10 border-destructivetext-destructive" 
                   : "bg-secondary/50 border-input text-muted-foreground hover:bg-secondary"
               }`}
             >
                {filterErrorOnly ? "Showing Errors Only" : "Show All"}
             </button>
        </div>
      </div>

       {/* Table */}
       <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 w-10"></th>
                <th className="p-3 min-w-[150px]">Item Name</th>
                <th className="p-3 min-w-[100px]">Category</th>
                <th className="p-3 w-32 text-right">Selling Price</th>
                <th className="p-3 w-32 text-right">Cost Price</th>
                <th className="p-3 w-24 text-center">Stock</th>
                <th className="p-3 w-24 text-center">Min</th>
                <th className="p-3 min-w-[150px]">Description</th>
                <th className="p-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {sortedItems.map((item) => {
                const hasError = Object.keys(item.errors).length > 0;
                const isEditing = editingId === item.tempId;
                
                return (
                  <tr 
                    key={item.tempId} 
                    className={`group transition-colors ${
                        isEditing ? "bg-primary/5 ring-1 ring-inset ring-primary/20" :
                        hasError ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="p-3 text-center">
                        {hasError ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500/50" />
                        )}
                    </td>
                    
                    {/* Name */}
                    <td className="p-2">
                        {isEditing ? (
                            <input
                                autoFocus
                                type="text"
                                value={item.itemName}
                                onChange={(e) => handleUpdateItem(item.tempId, "itemName", e.target.value)}
                                className={`w-full bg-transparent border-b border-transparent focus:border-primary px-1 py-1 outline-none transition-colors ${
                                    item.errors.itemName ? "border-destructive text-destructive placeholder:text-destructive/50" : ""
                                }`}
                                placeholder="Item Name"
                            />
                        ) : (
                            <div className={`px-1 py-1 ${item.errors.itemName ? "text-destructive font-medium" : "text-foreground"}`}>
                                {item.itemName || <span className="text-destructive/50 italic text-xs">Required</span>}
                            </div>
                        )}
                         {item.errors.itemName && <div className="text-[10px] text-destructive mt-0.5">{item.errors.itemName}</div>}
                    </td>

                     {/* Category */}
                     <td className="p-2">
                        {isEditing ? (
                            <input
                                type="text"
                                value={item.category || ""}
                                onChange={(e) => handleUpdateItem(item.tempId, "category", e.target.value)}
                                className={`w-full bg-transparent border-b border-transparent focus:border-primary px-1 py-1 outline-none transition-colors ${
                                    item.errors.category ? "border-destructive text-destructive" : ""
                                }`}
                                placeholder="Category"
                            />
                        ) : (
                            <div className={`px-1 py-1 ${item.errors.category ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                {item.category || <span className="text-destructive/50 italic text-xs">Required</span>}
                            </div>
                        )}
                         {item.errors.category && <div className="text-[10px] text-destructive mt-0.5">{item.errors.category}</div>}
                    </td>

                    {/* Selling Price */}
                    <td className="p-2">
                        {isEditing ? (
                             <input
                                type="number"
                                value={Number.isNaN(item.sellingPrice) ? "" : (item.sellingPrice ?? "")}
                                onChange={(e) => handleUpdateItem(item.tempId, "sellingPrice", parseFloat(e.target.value))}
                                className={`w-full bg-transparent border-b border-transparent focus:border-primary px-1 py-1 outline-none text-right font-mono ${
                                    item.errors.sellingPrice ? "border-destructive text-destructive" : ""
                                }`}
                            />
                        ) : (
                            <div className={`px-1 py-1 text-right font-mono ${item.errors.sellingPrice ? "text-destructive" : "text-foreground"}`}>
                                ₱{(item.sellingPrice ?? 0).toFixed(2)}
                            </div>
                        )}
                         {item.errors.sellingPrice && <div className="text-[10px] text-destructive text-right mt-0.5">{item.errors.sellingPrice}</div>}
                    </td>

                    {/* Cost Price */}
                    <td className="p-2">
                        {isEditing ? (
                             <input
                                type="number"
                                value={Number.isNaN(item.salesPrice) ? "" : (item.salesPrice ?? "")}
                                onChange={(e) => handleUpdateItem(item.tempId, "salesPrice", parseFloat(e.target.value))}
                                className={`w-full bg-transparent border-b border-transparent focus:border-primary px-1 py-1 outline-none text-right font-mono ${
                                    item.errors.salesPrice ? "border-destructive text-destructive" : ""
                                }`}
                            />
                        ) : (
                            <div className={`px-1 py-1 text-right font-mono ${item.errors.salesPrice ? "text-destructive" : "text-foreground"}`}>
                                ₱{(item.salesPrice ?? 0).toFixed(2)}
                            </div>
                        )}
                         {item.errors.salesPrice && <div className="text-[10px] text-destructive text-right mt-0.5">{item.errors.salesPrice}</div>}
                    </td>

                    {/* Stock */}
                    <td className="p-2">
                        {isEditing ? (
                             <input
                                type="number"
                                value={Number.isNaN(item.initialStock) ? "" : (item.initialStock ?? "")}
                                onChange={(e) => handleUpdateItem(item.tempId, "initialStock", parseFloat(e.target.value))}
                                className={`w-full bg-transparent border-b border-transparent focus:border-primary px-1 py-1 outline-none text-center font-mono ${
                                    item.errors.initialStock ? "border-destructive text-destructive" : ""
                                }`}
                            />
                        ) : (
                            <div className={`px-1 py-1 text-center font-mono ${item.errors.initialStock ? "text-destructive" : "text-foreground"}`}>
                                {item.initialStock}
                            </div>
                        )}
                         {item.errors.initialStock && <div className="text-[10px] text-destructive text-center mt-0.5">{item.errors.initialStock}</div>}
                    </td>

                     {/* Min Stock */}
                     <td className="p-2">
                        {isEditing ? (
                             <input
                                type="number"
                                value={Number.isNaN(item.lowStockThreshold) ? "" : (item.lowStockThreshold ?? "")}
                                onChange={(e) => handleUpdateItem(item.tempId, "lowStockThreshold", parseFloat(e.target.value))}
                                className={`w-full bg-transparent border-b border-transparent focus:border-primary px-1 py-1 outline-none text-center font-mono ${
                                    item.errors.lowStockThreshold ? "border-destructive text-destructive" : ""
                                }`}
                                placeholder="-"
                            />
                        ) : (
                            <div className={`px-1 py-1 text-center font-mono ${item.errors.lowStockThreshold ? "text-destructive" : "text-muted-foreground/60"}`}>
                                {item.lowStockThreshold ?? "—"}
                            </div>
                        )}
                         {item.errors.lowStockThreshold && <div className="text-[10px] text-destructive text-center mt-0.5">{item.errors.lowStockThreshold}</div>}
                    </td>

                    {/* Description */}
                    <td className="p-2">
                        {isEditing ? (
                             <input
                                type="text"
                                value={item.description || ""}
                                onChange={(e) => handleUpdateItem(item.tempId, "description", e.target.value)}
                                className="w-full bg-transparent border-b border-transparent focus:border-primary px-1 py-1 outline-none text-muted-foreground focus:text-foreground truncate"
                                placeholder="Optional desc"
                            />
                        ) : (
                            <div className="px-1 py-1 text-muted-foreground truncate max-w-[200px]" title={item.description || ""}>
                                {item.description || "—"}
                            </div>
                        )}
                    </td>

                    <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={doneEditing}
                                        className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                        title="Done Editing"
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>
                                    <button 
                                        onClick={cancelEditing}
                                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        title="Cancel Changes"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => startEditing(item)}
                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Edit Row"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                            )}
                            
                            <button 
                                onClick={() => handleDeleteItem(item.tempId)}
                                className={`p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ${isEditing ? "" : "opacity-0 group-hover:opacity-100"}`}
                                title="Remove Item"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>

                  </tr>
                );
              })}
              
              {items.length === 0 && (
                <tr>
                    <td colSpan={9} className="p-12 text-center text-muted-foreground">
                        No items to import.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Footer */}
      <div className="p-4 border-t border-border/40 bg-card/50 backdrop-blur-sm flex justify-between items-center">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all font-medium text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-4">
           {invalidItemsCount > 0 && (
               <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20 animate-pulse">
                  <AlertCircle className="w-4 h-4" />
                  <span>Fix {invalidItemsCount} errors to proceed</span>
               </div>
           )}

           <button
            onClick={() => onSubmit(items)}
            disabled={!isValid || isProcessing}
            className="flex items-center gap-2 px-10 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Import {totalItems} Items
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchImportReviewTable;
