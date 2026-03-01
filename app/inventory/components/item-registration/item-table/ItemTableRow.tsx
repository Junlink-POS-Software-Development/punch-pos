// app/inventory/components/item-registration/item-table/ItemTableRow.tsx

import React, { useState, useRef } from "react";
import { Trash2, Edit2, Check, X, Barcode, Package, Loader2, Camera } from "lucide-react";
import { InventoryItem } from "../../stocks-monitor/lib/inventory.api";
import { usePermissions } from "@/app/hooks/usePermissions";
import imageCompression from "browser-image-compression";
import { uploadItemImage } from "../lib/image.api";

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
    image_url: string | null;
  } | null;
  onUpdateField: (field: "item_name" | "sku" | "sales_price" | "unit_cost" | "description" | "image_url", value: string | null) => void;
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
  const { can_manage_items } = usePermissions();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (isEditing && can_manage_items) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const fd = new FormData();
      const finalFile = new File([compressedFile], file.name, { type: compressedFile.type });
      fd.append("file", finalFile);

      const publicUrl = await uploadItemImage(fd);
      onUpdateField("image_url", publicUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentImageUrl = isEditing ? editingData.image_url : item.image_url;

  return (
    <tr
      className={`group transition-colors ${
        isSelected ? "bg-primary/5" : "hover:bg-muted/30"
      } ${isEditing ? "bg-orange-500/5 ring-1 ring-orange-500/20" : ""}`}
    >
      <td className="px-4 py-1.5 border-b border-border">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.item_id)}
          className="rounded border-input text-primary focus:ring-primary size-4"
        />
      </td>
      <td className="px-4 py-1.5 border-b border-border">
        <div className="flex items-center gap-3">
          <div 
            className={`h-10 w-10 shrink-0 bg-muted rounded-lg border border-border flex items-center justify-center overflow-hidden relative group/image ${
              isEditing ? "cursor-pointer hover:border-orange-500/50 transition-colors" : ""
            }`}
            onClick={handleImageClick}
          >
            {isUploading ? (
              <Loader2 size={18} className="text-primary animate-spin" />
            ) : currentImageUrl ? (
              <img src={currentImageUrl} alt={item.item_name} className="h-full w-full object-cover" />
            ) : (
              <Package size={18} className="text-muted-foreground/30" />
            )}

            {isEditing && !isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                <Camera size={14} className="text-white" />
              </div>
            )}

            {isEditing && (
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            )}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editingData.item_name}
                onChange={(e) => onUpdateField("item_name", e.target.value)}
                className="w-full px-2 py-0.5 bg-background border border-orange-500/50 rounded outline-none text-sm font-medium"
                placeholder="Item Name"
              />
            ) : (
              <div className="font-medium text-foreground text-sm truncate">
                {item.item_name}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-1.5 border-b border-border">
        {isEditing ? (
          <input
            type="text"
            value={editingData.sku}
            onChange={(e) => onUpdateField("sku", e.target.value)}
            className="w-full px-2 py-0.5 bg-background border border-orange-500/50 rounded outline-none text-xs font-mono"
            placeholder="SKU"
          />
        ) : (
          <span className="font-mono text-xs">{item.sku}</span>
        )}
      </td>
      <td className="px-4 py-1.5 border-b border-border">
        <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded">
          {item.category || "General"}
        </span>
      </td>
      <td className="px-4 py-1.5 border-b border-border text-right">
        {isEditing ? (
          <input
            type="number"
            step="0.01"
            value={editingData.sales_price}
            onChange={(e) => onUpdateField("sales_price", e.target.value)}
            className="w-24 px-2 py-0.5 bg-background border border-orange-500/50 rounded outline-none text-sm font-medium text-right"
            placeholder="0.00"
          />
        ) : (
          <div className="font-medium text-sm text-foreground">
            ₱{(item.sales_price || 0).toLocaleString()}
          </div>
        )}
      </td>
      <td className="px-4 py-1.5 border-b border-border text-right">
        {isEditing ? (
          <input
            type="number"
            step="0.01"
            value={editingData.unit_cost}
            onChange={(e) => onUpdateField("unit_cost", e.target.value)}
            className="w-24 px-2 py-0.5 bg-background border border-orange-500/50 rounded outline-none text-xs text-muted-foreground text-right"
            placeholder="0.00"
          />
        ) : (
          <div className="text-muted-foreground text-xs">
            ₱{(item.unit_cost || 0).toLocaleString()}
          </div>
        )}
      </td>
      <td className="px-4 py-1.5 border-b border-border">
        {isEditing ? (
          <input
            type="text"
            value={editingData.description}
            onChange={(e) => onUpdateField("description", e.target.value)}
            className="w-full px-2 py-0.5 bg-background border border-orange-500/50 rounded outline-none text-xs"
            placeholder="Description..."
          />
        ) : (
          <span className="text-xs text-muted-foreground line-clamp-1" title={item.description || ""}>
            {item.description || "—"}
          </span>
        )}
      </td>
      <td className="px-4 py-1.5 border-b border-border text-right">
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
            {can_manage_items && (
              <>
                <button
                  onClick={onEdit}
                  className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
                  title="Edit Item"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={onGenerateBarcode}
                  className="p-1.5 text-purple-500 hover:bg-purple-500/10 rounded-md transition-colors"
                  title="Print Barcode"
                >
                  <Barcode size={16} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 text-destructive hover:bg-destructive/10 bg-destructive/5 rounded-lg transition-colors border border-destructive/10"
                  title="Delete Item"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default ItemTableRow;
