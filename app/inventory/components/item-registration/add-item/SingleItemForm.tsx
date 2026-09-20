import React, { useRef } from "react";
import { ImageIcon, ChevronDown, Pill, Calendar, Hash, ShieldAlert } from "lucide-react";
import { Category } from "../../../hooks/useCategories";
import { StandardSelect } from "@/components/reusables/StandardSelect";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";

interface SingleItemFormProps {
  formData: {
    name: string;
    description: string;
    category: string;
    sku: string;
    sellingPrice: string;
    stock: string;
    minStock: string;
    imageUrl: string | null;
    imageSize: string | null;
    genericName?: string;
    dosage?: string;
    formulation?: string;
    isRx?: boolean;
    brandType?: "branded" | "generic";
    batchNumber?: string;
    expiryDate?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: Category[];
  isProcessing: boolean;
  isUploading: boolean;
  handleSingleSubmit: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
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
  onReset,
  onCancel,
}) => {
  const { isPharmacy, modules } = useBusinessMode();
  const showPharmacyFields = isPharmacy || modules.prescription_rx || modules.batch_expiry;
  // Refs for focus management
  const nameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const sellingPriceRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);
  const stockRef = useRef<HTMLInputElement>(null);
  const minStockRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLElement | null>) => {
    if (e.key === "Enter") {
      if (e.shiftKey || !nextRef) {
        // Shift + Enter OR last field -> Submit form
        e.preventDefault();
        e.currentTarget.closest("form")?.requestSubmit();
        return;
      }
      
      // Regular Enter with next field -> Move to next field
      e.preventDefault();
      
      // Special handling for Select elements to open them on Enter
      if (e.currentTarget instanceof HTMLSelectElement) {
        try {
          (e.currentTarget as any).showPicker();
          return; // Don't move to next field yet
        } catch (err) {
          // Fallback if showPicker is not supported
          console.warn("showPicker not supported", err);
        }
      }

      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  const handleDiscard = () => {
    onReset();
    // Small delay to ensure state reset doesn't interfere with focus
    setTimeout(() => {
      nameRef.current?.focus();
    }, 50);
  };

  return (
    <form onSubmit={handleSingleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Row: Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Item Name <span className="text-primary">*</span>
          </label>
          <input
            ref={nameRef}
            required
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            onKeyDown={(e) => handleKeyDown(e, categoryRef)}
            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground/40 shadow-inner"
            placeholder="e.g., Croissant"
          />
        </div>
          <StandardSelect
            ref={categoryRef}
            label="Category"
            value={formData.category}
            onChange={(e) => {
              setFormData({ ...formData, category: e.target.value });
              if (e.target.value) {
                descriptionRef.current?.focus();
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, descriptionRef)}
          >
            <option value="" className="bg-background">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-background">
                {cat.category}
              </option>
            ))}
          </StandardSelect>
      </div>

      {/* Description Row */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
          Description
        </label>
        <textarea
          ref={descriptionRef}
          rows={2}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          onKeyDown={(e) => handleKeyDown(e, sellingPriceRef)}
          className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none resize-none text-foreground placeholder:text-muted-foreground/40 shadow-inner transition-all"
          placeholder="Enter a brief description of the item..."
        ></textarea>
      </div>

      {/* Middle Row: Pricing, SKU, Thumbnail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Unit Price (₱) <span className="text-primary">*</span>
          </label>
          <input
            ref={sellingPriceRef}
            required
            type="number"
            min="0"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) =>
              setFormData({ ...formData, sellingPrice: e.target.value })
            }
            onKeyDown={(e) => handleKeyDown(e, skuRef)}
            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all hover:border-foreground/20"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            SKU
          </label>
          <input
            ref={skuRef}
            type="text"
            value={formData.sku}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value })
            }
            onKeyDown={(e) => handleKeyDown(e, stockRef)}
            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all"
            placeholder="Auto-generate"
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Thumbnail
          </label>
          <div className="flex items-center gap-3 h-[50px]">
            <div className="h-full aspect-square bg-foreground/5 rounded-xl border border-foreground/10 flex items-center justify-center text-muted-foreground/60 overflow-hidden shadow-inner">
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
            <label className="flex-1 h-full px-4 flex flex-col items-center justify-center bg-foreground/5 hover:bg-foreground/10 border border-dashed border-foreground/20 rounded-xl transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-none">
                {isUploading ? "Uploading..." : "UPLOAD"}
              </span>
              {formData.imageSize && !isUploading && (
                <span className="text-[9px] text-muted-foreground/60 font-mono mt-1 leading-none">
                  {formData.imageSize}
                </span>
              )}
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

      {/* Pharmacy & Drug Formulation Section (Conditioned on Business Mode) */}
      {showPharmacyFields && (
        <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 space-y-6 shadow-inner backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Drug Formulation & Regulatory Info
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Pharmacy
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generics Act (RA 6675) & FDA compliance metadata
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Medicine Type: Branded vs Generic */}
              <div className="flex items-center p-1 bg-background/80 rounded-xl border border-emerald-500/20 shadow-xs">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, brandType: "branded" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    (formData.brandType || "branded") === "branded"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🏷️ Branded
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, brandType: "generic" })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.brandType === "generic"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  💊 Generic
                </button>
              </div>

              {/* Prescription (Rx) Toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none bg-background/80 hover:bg-background px-3.5 py-2 rounded-xl border border-emerald-500/30 transition-colors shadow-sm shrink-0">
                <div className="text-right">
                  <span className="text-xs font-bold block text-foreground">Prescription (Rx)</span>
                  <span className="text-[10px] text-muted-foreground">Requires MD license</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isRx || false}
                  onChange={(e) => setFormData({ ...formData, isRx: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                />
                {formData.isRx && (
                  <span className="text-[10px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 tracking-wider">
                    Rx
                  </span>
                )}
              </label>
            </div>
          </div>

          {/* Molecule, Strength & Formulation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                Generic Molecule Name
              </label>
              <input
                type="text"
                value={formData.genericName || ""}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-foreground placeholder:text-muted-foreground/40 shadow-inner text-sm transition-all"
                placeholder="e.g. Paracetamol, Amoxicillin"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                Dosage / Strength
              </label>
              <input
                type="text"
                value={formData.dosage || ""}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-foreground placeholder:text-muted-foreground/40 shadow-inner text-sm transition-all"
                placeholder="e.g. 500mg, 125mg/5mL"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
                Dosage Form / Formulation
              </label>
              <select
                value={formData.formulation || ""}
                onChange={(e) => setFormData({ ...formData, formulation: e.target.value })}
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-foreground shadow-inner text-sm transition-all cursor-pointer"
              >
                <option value="" className="bg-background">Select Form</option>
                <option value="Tablet" className="bg-background">Tablet</option>
                <option value="Capsule" className="bg-background">Capsule</option>
                <option value="Syrup" className="bg-background">Syrup</option>
                <option value="Suspension" className="bg-background">Suspension</option>
                <option value="Oral Drops" className="bg-background">Oral Drops</option>
                <option value="Cream / Ointment" className="bg-background">Cream / Ointment</option>
                <option value="Vial / Injection" className="bg-background">Vial / Injection</option>
                <option value="Inhaler / Nebule" className="bg-background">Inhaler / Nebule</option>
                <option value="Suppository" className="bg-background">Suppository</option>
                <option value="Medical Supply" className="bg-background">Medical Supply / Device</option>
              </select>
            </div>
          </div>

          {/* Batch / Expiry Date (FEFO) */}
          {(isPharmacy || modules.batch_expiry) && (
            <div className="pt-2 border-t border-emerald-500/10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-emerald-500" />
                  Initial Batch / Lot Number (FEFO)
                </label>
                <input
                  type="text"
                  value={formData.batchNumber || ""}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-foreground placeholder:text-muted-foreground/40 shadow-inner text-sm transition-all"
                  placeholder="e.g. LOT-2026-08A"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Expiration Date (FEFO)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none text-foreground shadow-inner text-sm transition-all cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Inventory */}
      <div className="p-6 bg-foreground/5 rounded-2xl border border-foreground/5 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-inner backdrop-blur-sm">
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Initial Stock balance
          </label>
          <input
            ref={stockRef}
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            onKeyDown={(e) => handleKeyDown(e, minStockRef)}
            className="w-full px-4 py-3 bg-black/20 border border-foreground/5 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all"
            placeholder="0"
          />
        </div>
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 ml-1">
            Low Stock threshold
          </label>
          <input
            ref={minStockRef}
            type="number"
            min="0"
            value={formData.minStock}
            onChange={(e) =>
              setFormData({ ...formData, minStock: e.target.value })
            }
            onKeyDown={(e) => handleKeyDown(e)}
            className="w-full px-4 py-3 bg-black/20 border border-foreground/5 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground shadow-inner transition-all"
            placeholder="e.g. 10"
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-4 border-t border-foreground/5">
        <button
          type="button"
          onClick={handleDiscard}
          className="px-8 py-3 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
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

export { SingleItemForm };
