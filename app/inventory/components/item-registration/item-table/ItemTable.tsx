// app/inventory/components/item-registration/item-table/ItemTable.tsx

import React from "react";
import { ArrowUpDown } from "lucide-react";
import TableToolbar from "./TableToolbar";
import ItemTableRow from "./ItemTableRow";
import { InventoryItem } from "../../stocks-monitor/lib/inventory.api";
import { SortKey, SortConfig } from "../hooks/useItemTable";

interface ItemTableProps {
  displayItems: InventoryItem[];
  filteredItems: InventoryItem[];
  selectedItems: string[];
  toggleSelectAll: () => void;
  toggleSelectItem: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortConfig: SortConfig;
  handleSort: (key: SortKey) => void;
  onAddClick: () => void;
  onDeleteSelected: () => void;
  onEditSelected: () => void;
  onGenerateBarcodes: () => void;
  onClearSelection: () => void;
  batchEditMode: boolean;
  editingRows: Record<string, {
    item_name: string;
    sku: string;
    sales_price: string;
    unit_cost: string;
    description: string;
  }>;
  editingCount: number;
  handleUpdateEditingField: (id: string, field: "item_name" | "sku" | "sales_price" | "unit_cost" | "description", value: string) => void;
  handleSaveInlineEdit: (item: InventoryItem) => void;
  handleCancelInlineEdit: (id: string) => void;
  handleEdit: (item: InventoryItem) => void;
  handleDeleteSingle: (item: InventoryItem) => void;
  handleSingleBarcodeGeneration: (item: InventoryItem) => void;
  handleTableScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const ItemTable: React.FC<ItemTableProps> = ({
  displayItems,
  filteredItems,
  selectedItems,
  toggleSelectAll,
  toggleSelectItem,
  searchQuery,
  setSearchQuery,
  sortConfig,
  handleSort,
  onAddClick,
  onDeleteSelected,
  onEditSelected,
  onGenerateBarcodes,
  onClearSelection,
  batchEditMode,
  editingRows,
  editingCount,
  handleUpdateEditingField,
  handleSaveInlineEdit,
  handleCancelInlineEdit,
  handleEdit,
  handleDeleteSingle,
  handleSingleBarcodeGeneration,
  handleTableScroll,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
}) => {
  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <TableToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCount={selectedItems.length}
        onAddClick={onAddClick}
        onDeleteSelected={onDeleteSelected}
        onEditSelected={onEditSelected}
        onGenerateBarcodes={onGenerateBarcodes}
        onClearSelection={onClearSelection}
        batchEditMode={batchEditMode}
        editingCount={editingCount}
      />

      {/* Table Header (Fixed) */}
      <div className="overflow-x-auto grow" onScroll={handleTableScroll}>
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 border-b border-border w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length === filteredItems.length &&
                    filteredItems.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
              </th>
              {[
                { label: "Item Name", key: "item_name", width: "w-[25%]" },
                { label: "SKU", key: "sku", width: "w-[12%]" },
                { label: "Category", key: null, width: "w-[12%]" },
                { label: "Sales Price", key: "sales_price", width: "w-[12%]" },
                { label: "Unit Cost", key: "unit_cost", width: "w-[12%]" },
                { label: "Description", key: "description", width: "grow" },
              ].map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-3 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                    col.key ? "cursor-pointer hover:text-primary transition-colors" : ""
                  } ${col.key === "sales_price" || col.key === "unit_cost" ? "text-right" : ""} ${
                    col.width || ""
                  }`}
                  onClick={() => col.key && col.key !== "description" && handleSort(col.key as SortKey)}
                >
                  <div
                    className={`flex items-center gap-1 ${
                      col.key === "sales_price" || col.key === "unit_cost" ? "justify-end" : ""
                    }`}
                  >
                    {col.label}
                    {col.key && col.key !== "description" && (
                      <ArrowUpDown
                        size={12}
                        className={sortConfig.key === col.key ? "text-primary" : "text-muted-foreground/50"}
                      />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 border-b border-border text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {displayItems.length > 0 ? (
              displayItems.map((item) => (
                <ItemTableRow
                  key={item.item_id}
                  item={item}
                  isSelected={selectedItems.includes(item.item_id)}
                  onToggleSelect={toggleSelectItem}
                  editingData={editingRows[item.item_id] || null}
                  onUpdateField={(field, value) => handleUpdateEditingField(item.item_id, field as any, value)}
                  onSave={() => handleSaveInlineEdit(item)}
                  onCancel={() => handleCancelInlineEdit(item.item_id)}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDeleteSingle(item)}
                  onGenerateBarcode={() => handleSingleBarcodeGeneration(item)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  {isLoading ? "Loading items..." : "No items found matching your search."}
                </td>
              </tr>
            )}
            {isFetchingNextPage && (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-sm text-muted-foreground italic">
                  Loading more items...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemTable;
