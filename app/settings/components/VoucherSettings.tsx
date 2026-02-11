"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Category,
  fetchCategories,
  setDefaultVoucherSource,
} from "@/app/inventory/components/item-registration/lib/categories.api";

export default function VoucherSettings() {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const handleSetDefault = async (id: string) => {
    setUpdating(true);
    try {
      await setDefaultVoucherSource(id);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      alert("Failed to update default source");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-400">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Voucher Deduction Settings
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Select the default product category where voucher deductions will be
          automatically recorded as expenses.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              cat.is_default_voucher_source
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border/50 bg-muted/20 hover:bg-muted/40"
            }`}
          >
            <span className={`font-semibold tracking-tight ${cat.is_default_voucher_source ? 'text-primary' : 'text-foreground'}`}>
              {cat.category}
            </span>
            
            {cat.is_default_voucher_source ? (
              <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/20 rounded-full border border-primary/20">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Default Source
              </div>
            ) : (
              <button
                onClick={() => handleSetDefault(cat.id)}
                disabled={updating}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                Set as Default
              </button>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-muted-foreground italic text-sm text-center py-8 text-slate-500">No categories found.</p>
        )}
      </div>
    </div>
  );
}
