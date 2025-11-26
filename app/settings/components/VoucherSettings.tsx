"use client";

import { useEffect, useState } from "react";
import {
  Category,
  fetchCategories,
  setDefaultVoucherSource,
} from "@/app/inventory/components/item-registration/lib/categories.api";

export default function VoucherSettings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSetDefault = async (id: string) => {
    setUpdating(true);
    try {
      await setDefaultVoucherSource(id);
      await loadCategories(); // Reload to reflect changes (database trigger updates others)
    } catch (error) {
      alert("Failed to update default source");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-400">Loading categories...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-2 text-white">
        Voucher Deduction Settings
      </h2>
      <p className="text-slate-400 mb-6 text-sm">
        Select the default product category where voucher deductions will be
        recorded as expenses.
      </p>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              cat.is_default_voucher_source
                ? "border-cyan-500/50 bg-cyan-500/10"
                : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
            }`}
          >
            <span className={`font-medium ${cat.is_default_voucher_source ? 'text-cyan-400' : 'text-slate-300'}`}>
              {cat.category}
            </span>
            
            {cat.is_default_voucher_source ? (
              <span className="px-3 py-1 text-xs font-semibold text-cyan-400 bg-cyan-500/20 rounded-full border border-cyan-500/20">
                Default Source
              </span>
            ) : (
              <button
                onClick={() => handleSetDefault(cat.id)}
                disabled={updating}
                className="text-sm text-slate-500 hover:text-cyan-400 font-medium disabled:opacity-50 transition-colors"
              >
                Set as Default
              </button>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-slate-500 italic">No categories found.</p>
        )}
      </div>
    </div>
  );
}
