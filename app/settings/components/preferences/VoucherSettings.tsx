"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Combine, Info } from "lucide-react";
import {
  Category,
  fetchCategories,
  setDefaultVoucherSource,
} from "@/app/inventory/components/item-registration/lib/categories.api";
import { fetchDrawerMode } from "@/app/dashboard/lib/dashboard.api";
import { updateDrawerMode } from "@/app/actions/store";

export function VoucherSettings() {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const [toggling, setToggling] = useState(false);

  // ─── Drawer Mode ───────────────────────────────────────────────────────────
  const { data: drawerMode = "unified", isLoading: loadingMode } = useQuery({
    queryKey: ["drawer-mode"],
    queryFn: fetchDrawerMode,
    staleTime: 1000 * 60 * 30,
  });

  const isMultiDrawer = drawerMode === "multiple";

  // ─── Categories (for voucher source picker) ────────────────────────────────
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: isMultiDrawer,
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleMode = async () => {
    setToggling(true);
    try {
      const newMode = isMultiDrawer ? "unified" : "multiple";
      const result = await updateDrawerMode(newMode);
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ["drawer-mode"] });
      } else {
        alert(result.error || "Failed to update drawer mode");
      }
    } catch (error) {
      alert("Failed to update drawer mode");
      console.error(error);
    } finally {
      setToggling(false);
    }
  };

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

  if (loadingMode) return <div className="p-4 text-muted-foreground">Loading drawer settings...</div>;

  return (
    <div className="space-y-6">
      {/* ─── Drawer Mode Toggle ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Cash Drawer Mode
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Choose how your store tracks cash flow across product categories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Unified Drawer Option */}
        <button
          onClick={() => isMultiDrawer && handleToggleMode()}
          disabled={toggling || !isMultiDrawer}
          className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left group ${
            !isMultiDrawer
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border"
          } ${toggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${
              !isMultiDrawer
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground group-hover:text-foreground"
            }`}>
              <Combine size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold tracking-tight ${!isMultiDrawer ? "text-primary" : "text-foreground"}`}>
                  Unified Drawer
                </h3>
                {!isMultiDrawer && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                All sales flow into a single cash pool. Best for most businesses with straightforward operations.
              </p>
            </div>
          </div>
        </button>

        {/* Multiple Drawers Option */}
        <button
          onClick={() => !isMultiDrawer && handleToggleMode()}
          disabled={toggling || isMultiDrawer}
          className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left group ${
            isMultiDrawer
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border"
          } ${toggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${
              isMultiDrawer
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground group-hover:text-foreground"
            }`}>
              <Layers size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold tracking-tight ${isMultiDrawer ? "text-primary" : "text-foreground"}`}>
                  Multiple Drawers
                </h3>
                {isMultiDrawer && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/20 px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Track cash per product category. See per-category sales breakdowns and individual drawer balances.
              </p>
            </div>
          </div>
          {!isMultiDrawer && (
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-amber-500 font-medium">
              <Info size={12} />
              Experimental — for advanced multi-source setups
            </div>
          )}
        </button>
      </div>

      {/* ─── Voucher Source Settings (only in Multiple mode) ────────────────── */}
      <div className={`transition-all duration-500 overflow-hidden ${
        isMultiDrawer ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-t border-border pt-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Voucher Deduction Source
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Select the category where invoice-level voucher deductions are applied.
              </p>
            </div>
          </div>

          {loadingCategories ? (
            <div className="p-4 text-muted-foreground text-sm">Loading categories...</div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                    cat.is_default_voucher_source
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/50 bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <span className={`font-semibold tracking-tight text-sm ${cat.is_default_voucher_source ? "text-primary" : "text-foreground"}`}>
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
                <p className="text-muted-foreground italic text-sm text-center py-6">No categories found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
