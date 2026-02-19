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
    <form onSubmit={handleSingleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Row: Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Item Name <span className="text-primary">*</span>
          </label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground/40 shadow-inner"
            placeholder="e.g., Croissant"
          />
        </div>
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none cursor-pointer text-foreground shadow-inner"
          >
            <option value="" className="bg-slate-900">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-slate-900">
                {cat.category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description Row */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
          Description
        </label>
        <textarea
          rows={2}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none resize-none text-foreground placeholder:text-muted-foreground/40 shadow-inner transition-all"
          placeholder="Enter a brief description of the item..."
        ></textarea>
      </div>

      {/* Middle Row: Pricing, SKU, Thumbnail */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Unit Price (₱) <span className="text-primary">*</span>
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
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all hover:border-white/20"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Unit Cost (₱){" "}
            <span className="text-muted-foreground/50 font-normal lowercase italic">
              (opt.)
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
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all hover:border-white/20"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value })
            }
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all"
            placeholder="Auto-generate"
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Thumbnail
          </label>
          <div className="flex items-center gap-3 h-[50px]">
            <div className="h-full aspect-square bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-muted-foreground/60 overflow-hidden shadow-inner">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Thumbnail"
                  className="h-full w-full object-cover animate-in fade-in zoom-in-50 duration-500"
                />
              ) : (
                <ImageIcon size={20} />
              )}
            </div>
            <label className="flex-1 h-full px-4 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-dashed border-white/20 rounded-xl text-xs font-semibold text-primary/80 hover:text-primary transition-all cursor-pointer">
              {isUploading ? "..." : "UPLOAD"}
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
      <div className="p-6 bg-white/5 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-inner backdrop-blur-sm">
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Initial Stock balance
          </label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all"
            placeholder="0"
          />
        </div>
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Low Stock threshold
          </label>
          <input
            type="number"
            min="0"
            value={formData.minStock}
            onChange={(e) =>
              setFormData({ ...formData, minStock: e.target.value })
            }
            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all"
            placeholder="e.g. 10"
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="px-10 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/25 transition-all disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
        >
          {isProcessing ? "Saving..." : "Create Item"}
        </button>
      </div>
    </form>

  );
};

export default SingleItemForm;
