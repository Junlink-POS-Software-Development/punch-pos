// app/inventory/components/item-registration/add-item/SingleItemForm.tsx

import React from "react";
import { ImageIcon } from "lucide-react";
import { Category } from "../../../hooks/useCategories";

interface SingleItemFormProps {
  formData: {
    name: string;
    description: string;
    category: string;
    sku: string;
    sellingPrice: string;
    salesPrice: string;
    stock: string;
    minStock: string;
    imageUrl: string | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    description: string;
    category: string;
    sku: string;
    sellingPrice: string;
    salesPrice: string;
    stock: string;
    minStock: string;
    imageUrl: string | null;
  }>>;
  categories: Category[];
  isProcessing: boolean;
  isUploading: boolean;
  handleSingleSubmit: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
}

const SingleItemForm: React.FC<SingleItemFormProps> = ({
  formData,
  setFormData,
  categories,
  isProcessing,
  isUploading,
  handleSingleSubmit,
  handleImageUpload,
  onCancel,
}) => {
  return (
    <form onSubmit={handleSingleSubmit} className="space-y-6">
      {/* Top Row: Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Item Name <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all text-foreground"
            placeholder="e.g., Croissant"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description Row */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          rows={2}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none resize-none text-foreground"
          placeholder="Enter a brief description of the item..."
        ></textarea>
      </div>

      {/* Middle Row: Pricing, SKU, Thumbnail */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Selling Price (₱) <span className="text-destructive">*</span>
          </label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) =>
              setFormData({ ...formData, sellingPrice: e.target.value })
            }
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none text-foreground"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Unit Cost (₱){" "}
            <span className="text-muted-foreground font-normal text-xs">
              (Optional)
            </span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.salesPrice}
            onChange={(e) =>
              setFormData({ ...formData, salesPrice: e.target.value })
            }
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none text-foreground"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            SKU{" "}
            <span className="text-muted-foreground font-normal text-xs ml-1">
              (Auto)
            </span>
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value })
            }
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none text-foreground"
            placeholder="Auto-generate"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Thumbnail
          </label>
          <div className="flex items-center gap-2 h-[42px]">
            <div className="h-full aspect-square bg-muted rounded-lg border border-border flex items-center justify-center text-muted-foreground overflow-hidden">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon size={18} />
              )}
            </div>
            <label className="text-sm text-primary font-medium hover:underline whitespace-nowrap cursor-pointer">
              {isUploading ? "Uploading..." : "Upload"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Bottom Row: Inventory */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Initial Stock
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none text-foreground"
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Min. Stock Alert Level
          </label>
          <input
            type="number"
            min="0"
            value={formData.minStock}
            onChange={(e) =>
              setFormData({ ...formData, minStock: e.target.value })
            }
            className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring outline-none text-foreground"
            placeholder="e.g. 10"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {isProcessing ? "Saving..." : "Save Item"}
        </button>
      </div>
    </form>
  );
};

export default SingleItemForm;
