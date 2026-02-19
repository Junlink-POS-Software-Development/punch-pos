// app/inventory/components/item-registration/store/useItemRegStore.ts

import { create } from "zustand";
import { InventoryItem } from "../../stocks-monitor/lib/inventory.api";

export type ViewMode = "list" | "add";
export type AddTab = "single" | "batch";
export type SortKey = "item_name" | "sales_price" | "unit_cost" | "current_stock";

export interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

interface ItemRegState {
  // Navigation State
  viewMode: ViewMode;
  addTab: AddTab;
  
  // Table State
  searchQuery: string;
  selectedItems: string[];
  sortConfig: SortConfig;
  batchEditMode: boolean;
  editingRows: Record<string, {
    item_name: string;
    sku: string;
    sales_price: string;
    unit_cost: string;
    description: string;
  }>;

  // Barcode State
  barcodeModalData: InventoryItem[] | null;

  // Actions
  setViewMode: (viewMode: ViewMode) => void;
  setAddTab: (addTab: AddTab) => void;
  setSearchQuery: (query: string) => void;
  setSelectedItems: (items: string[] | ((prev: string[]) => string[])) => void;
  setSortConfig: (config: SortConfig | ((prev: SortConfig) => SortConfig)) => void;
  setBatchEditMode: (mode: boolean) => void;
  setEditingRows: (rows: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
  setBarcodeModalData: (data: InventoryItem[] | null) => void;
  
  // Helper Actions (Selection)
  toggleSelectItem: (id: string) => void;
  clearSelection: () => void;
}

export const useItemRegStore = create<ItemRegState>((set) => ({
  // Initial State
  viewMode: "list",
  addTab: "single",
  searchQuery: "",
  selectedItems: [],
  sortConfig: {
    key: "item_name",
    direction: "asc",
  },
  batchEditMode: false,
  editingRows: {},
  barcodeModalData: null,

  // Actions
  setViewMode: (viewMode) => set({ viewMode }),
  setAddTab: (addTab) => set({ addTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedItems: (items) => set((state) => ({
    selectedItems: typeof items === "function" ? items(state.selectedItems) : items
  })),
  setSortConfig: (sortConfig) => set((state) => ({
    sortConfig: typeof sortConfig === "function" ? sortConfig(state.sortConfig) : sortConfig
  })),
  setBatchEditMode: (batchEditMode) => set({ batchEditMode }),
  setEditingRows: (editingRows) => set((state) => ({
    editingRows: typeof editingRows === "function" ? editingRows(state.editingRows) : editingRows
  })),
  setBarcodeModalData: (barcodeModalData) => set({ barcodeModalData }),

  toggleSelectItem: (id) => set((state) => {
    const isSelected = state.selectedItems.includes(id);
    const newSelected = isSelected
      ? state.selectedItems.filter((i) => i !== id)
      : [...state.selectedItems, id];
    
    // If we deselect an item that was being edited, we should probably handle that too,
    // but the hook was doing it conditionally. We'll mirror that logic in the hook or здесь.
    return { selectedItems: newSelected };
  }),

  clearSelection: () => set({ selectedItems: [] }),
}));
