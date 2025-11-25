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

  if (loading) return <div className="p-4">Loading categories...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Voucher Deduction Settings
      </h2>
      <p className="text-gray-600 mb-6 text-sm">
        Select the default product category where voucher deductions will be
        recorded as expenses.
      </p>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center justify-between p-4 rounded-md border ${
              cat.is_default_voucher_source
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="font-medium text-gray-700">{cat.category}</span>
            
            {cat.is_default_voucher_source ? (
              <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                Default Source
              </span>
            ) : (
              <button
                onClick={() => handleSetDefault(cat.id)}
                disabled={updating}
                className="text-sm text-gray-500 hover:text-blue-600 font-medium disabled:opacity-50"
              >
                Set as Default
              </button>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-gray-500 italic">No categories found.</p>
        )}
      </div>
    </div>
  );
}
