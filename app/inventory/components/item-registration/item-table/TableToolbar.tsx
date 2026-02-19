// app/inventory/components/item-registration/item-table/TableToolbar.tsx

import React from "react";
import { Search, Plus, Trash2, Edit, ScanBarcode, X } from "lucide-react";
import { useItemTable } from "../hooks/useItemTable";

interface TableToolbarProps {
  onAddClick: () => void;
  onGenerateBarcodes: () => void;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  onAddClick,
  onGenerateBarcodes,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedItems,
    handleDeleteSelected,
    handleEditSelected,
    clearSelection,
    batchEditMode,
    editingCount,
  } = useItemTable();

  const selectedCount = selectedItems.length;

  return (
    <div className="flex flex-col md:flex-row gap-3 justify-between items-center px-4 py-3 border-b border-border shrink-0">
      {/* Search + Add */}
      <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search items, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none text-sm text-foreground"
          />
        </div>
        {!batchEditMode && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add Item
          </button>
        )}
      </div>

      {/* Batch Actions */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 && !batchEditMode && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
            <div className="flex items-center gap-0.5 bg-primary/10 rounded overflow-hidden border border-primary/20">
              <span className="text-sm font-medium text-primary px-2 py-1">
                {selectedCount} selected
              </span>
              <button
                onClick={clearSelection}
                className="p-1 px-1.5 hover:bg-primary/20 text-primary border-l border-primary/20 transition-colors"
                title="Clear Selection"
              >
                <X size={14} />
              </button>
            </div>
            <button
              onClick={handleEditSelected}
              className="p-2 text-primary hover:bg-primary/20 bg-primary/10 rounded-lg transition-all border border-primary/20 shadow-sm"
              title="Batch Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={onGenerateBarcodes}
              className="p-2 text-primary hover:bg-primary/20 bg-primary/10 rounded-lg transition-all border border-primary/20 shadow-sm"
              title="Generate Barcodes"
            >
              <ScanBarcode size={18} />
            </button>
            <button
              onClick={handleDeleteSelected}
              className="p-2 text-destructive hover:bg-destructive bg-destructive/10 hover:text-destructive-foreground rounded-lg transition-all border border-destructive/20 shadow-sm"
              title="Delete Selected"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}

        {batchEditMode && (
          <div className="flex items-center gap-2 animate-in fade-in">
            <span className="text-sm font-medium text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Editing {editingCount} items
            </span>
            <p className="text-xs text-muted-foreground italic max-w-[200px] hidden lg:block">
              Submit individual rows to save changes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableToolbar;
