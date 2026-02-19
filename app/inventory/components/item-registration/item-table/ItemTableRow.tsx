// app/inventory/components/item-registration/item-table/ItemTableRow.tsx

import React from "react";
import { Check, X, Edit, Trash2, ScanBarcode } from "lucide-react";
import { InventoryItem } from "../../stocks-monitor/lib/inventory.api";

interface ItemTableRowProps {
  item: InventoryItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  editingData: {
    item_name: string;
    sku: string;
    sales_price: string;
    unit_cost: string;
    description: string;
  } | null;
  onUpdateField: (field: "item_name" | "sku" | "sales_price" | "unit_cost" | "description", value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateBarcode: () => void;
}

const ItemTableRow: React.FC<ItemTableRowProps> = ({
  item,
  isSelected,
  onToggleSelect,
  editingData,
  onUpdateField,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onGenerateBarcode,
}) => {
  const isEditing = !!editingData;

  return (
    <tr
      className={`group transition-colors ${
        isSelected ? "bg-primary/5" : "hover:bg-muted/30"
      } ${isEditing ? "bg-orange-500/5 ring-1 ring-orange-500/20" : ""}`}
    >
      <td className="px-4 py-3 border-b border-border">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.item_id)}
          className="rounded border-input text-primary focus:ring-primary size-4"
        />
      </td>
      <td className="px-4 py-3 border-b border-border">
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editingData.item_name}
            onChange={(e) => onUpdateField("item_name", e.target.value)}
            className="w-full px-2 py-1 bg-background border border-orange-500/50 rounded outline-none text-sm"
          />
        ) : (
          <div className="font-medium text-foreground">
            {item.item_name}
          </div>
        )}
      </td>
      <td className="px-4 py-3 border-b border-border font-mono text-xs">
        {isEditing ? (
          <input
            type="text"
            value={editingData.sku}
            onChange={(e) => onUpdateField("sku", e.target.value)}
            className="w-full px-2 py-1 bg-background border border-orange-500/50 rounded outline-none text-xs"
          />
        ) : (
          item.sku
        )}
      </td>
      <td className="px-4 py-3 border-b border-border">
        <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded">
          {item.category || "General"}
        </span>
      </td>
      <td className="px-4 py-3 border-b border-border text-right font-medium">
        {isEditing ? (
          <div className="flex items-center justify-end gap-1">
            <span className="text-muted-foreground text-xs">₱</span>
            <input
              type="number"
              step="0.01"
              value={editingData.sales_price}
              onChange={(e) => onUpdateField("sales_price", e.target.value)}
              className="w-20 px-2 py-1 bg-background border border-orange-500/50 rounded outline-none text-sm text-right"
            />
          </div>
        ) : (
          `₱${(item.sales_price || 0).toLocaleString()}`
        )}
      </td>
      <td className="px-4 py-3 border-b border-border text-right text-muted-foreground">
        {isEditing ? (
          <div className="flex items-center justify-end gap-1">
            <span className="text-muted-foreground text-xs">₱</span>
            <input
              type="number"
              step="0.01"
              value={editingData.unit_cost}
              onChange={(e) => onUpdateField("unit_cost", e.target.value)}
              className="w-20 px-2 py-1 bg-background border border-orange-500/50 rounded outline-none text-sm text-right"
            />
          </div>
        ) : (
          `₱${(item.unit_cost || 0).toLocaleString()}`
        )}
      </td>
      <td className="px-4 py-3 border-b border-border">
        {isEditing ? (
          <input
            type="text"
            value={editingData.description}
            onChange={(e) => onUpdateField("description", e.target.value)}
            className="w-full px-2 py-1 bg-background border border-orange-500/50 rounded outline-none text-xs"
            placeholder="Description..."
          />
        ) : (
          <span className="text-xs text-muted-foreground line-clamp-1" title={item.description || ""}>
            {item.description || "—"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 border-b border-border text-right">
        {isEditing ? (
          <div className="flex justify-end gap-1">
            <button
              onClick={onSave}
              className="p-1 px-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <Check size={14} /> Save
            </button>
            <button
              onClick={onCancel}
              className="p-1 px-2 border border-border bg-card rounded hover:bg-muted transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-1 transition-all">
            <button
              onClick={onEdit}
              className="p-1.5 text-blue-500 hover:bg-blue-500/10 bg-blue-500/5 rounded-lg transition-colors border border-blue-500/10"
              title="Quick Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={onGenerateBarcode}
              className="p-1.5 text-primary hover:bg-primary/10 bg-primary/5 rounded-lg transition-colors border border-primary/10"
              title="Generate Barcode"
            >
              <ScanBarcode size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-destructive hover:bg-destructive/10 bg-destructive/5 rounded-lg transition-colors border border-destructive/10"
              title="Delete Item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default ItemTableRow;
