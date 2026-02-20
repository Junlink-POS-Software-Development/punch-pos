// app/inventory/components/item-registration/item-table/ItemTable.tsx

import React from "react";
import { ArrowUpDown } from "lucide-react";
import TableToolbar from "./TableToolbar";
import ItemTableRow from "./ItemTableRow";
import { useItemTable, SortKey } from "../hooks/useItemTable";
import { useBarcode } from "../hooks/useBarcode";

interface ItemTableProps {
  onAddClick: () => void;
  onGenerateBarcodes: () => void;
}

const ItemTable: React.FC<ItemTableProps> = ({
  onAddClick,
  onGenerateBarcodes,
}) => {
  const {
    displayItems,
    filteredItems,
    selectedItems,
    toggleSelectAll,
    toggleSelectItem,
    sortConfig,
    handleSort,
    batchEditMode,
    editingRows,
    editingCount,
    handleUpdateEditingField,
    handleSaveInlineEdit,
    handleCancelInlineEdit,
    handleEdit,
    handleDeleteSingle,
    handleTableScroll,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
  } = useItemTable();

  const { handleSingleBarcodeGeneration } = useBarcode();

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <TableToolbar
        onAddClick={onAddClick}
        onGenerateBarcodes={onGenerateBarcodes}
      />

      {/* Table Header (Fixed) */}
      <div className="overflow-x-auto grow" onScroll={handleTableScroll}>
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10 shadow-sm">
            <tr>
              <th className="px-4 py-2 border-b border-border w-10">
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
                { label: "Item Group", key: "item_name", width: "w-[30%] min-w-[180px]" },
                { label: "SKU", key: "sku", width: "w-[12%] min-w-[90px]" },
                { label: "Category", key: null, width: "w-[12%] min-w-[100px]" },
                { label: "Unit Price", key: "sales_price", width: "w-[10%] min-w-[80px]" },
                { label: "Unit Cost", key: "unit_cost", width: "w-[10%] min-w-[80px]" },
                { label: "Description", key: "description", width: "grow min-w-[150px]" },
              ].map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-2 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${
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
              <th className="px-4 py-2 border-b border-border text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                  onUpdateField={(field: string, value: any) => handleUpdateEditingField(item.item_id, field as any, value)}
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
