"use client";

import React, { useState } from "react";
import {
  Store,
  Pill,
  Apple,
  UtensilsCrossed,
  Building2,
  Scissors,
  SlidersHorizontal,
  Check,
  Loader2,
  Sparkles,
  Layers,
  Info,
  X,
  AlertTriangle,
  Scale,
  ChefHat,
  Receipt,
  Users,
  CalendarCheck,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import {
  BusinessMode,
  BUSINESS_MODE_PRESETS,
  ModulesConfig,
} from "@/lib/types/businessMode";

// Icon mapping helper
const MODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Store,
  Pill,
  Apple,
  UtensilsCrossed,
  Building2,
  Scissors,
  SlidersHorizontal,
};

interface ModuleItem {
  key: keyof ModulesConfig;
  label: string;
  description: string;
  category: "health" | "grocery" | "dining" | "enterprise";
  icon: React.ComponentType<{ className?: string }>;
}

const MODULE_ITEMS: ModuleItem[] = [
  // Health & Regulatory
  {
    key: "batch_expiry",
    label: "Batch & Expiration Tracking (FEFO)",
    description: "Track lot numbers, expiration dates, and auto-recommend first-expired stock.",
    category: "health",
    icon: CalendarCheck,
  },
  {
    key: "prescription_rx",
    label: "Prescription (Rx) Validation",
    description: "Log attending physician license details, patient name, and prescription slip references.",
    category: "health",
    icon: FileText,
  },
  {
    key: "statutory_sc_pwd",
    label: "Senior Citizen & PWD Statutory Discount",
    description: "Calculates statutory 20% discount and VAT exemption with ID/booklet recording.",
    category: "health",
    icon: ShieldCheck,
  },
  // Grocery & Produce
  {
    key: "weighed_items",
    label: "Weighed Items & Scale Parser",
    description: "Read random-weight produce barcodes (EAN-13 prefix) and tare weight deductions.",
    category: "grocery",
    icon: Scale,
  },
  {
    key: "fast_cash_tender",
    label: "Fast Cash Tender Keys",
    description: "One-click cash payment buttons (₱100, ₱500, ₱1,000, Exact Cash) for fast checkout.",
    category: "grocery",
    icon: Receipt,
  },
  // Dining & Hospitality
  {
    key: "table_management",
    label: "Floor Plan & Table Management",
    description: "Visual floor map with table status (vacant, seated, billing) and dine-in tracking.",
    category: "dining",
    icon: UtensilsCrossed,
  },
  {
    key: "menu_modifiers",
    label: "Menu Modifiers & Add-ons",
    description: "Customization prompts for sizes, sweetness levels, toppings, and cooking temperatures.",
    category: "dining",
    icon: ChefHat,
  },
  {
    key: "kitchen_display",
    label: "Kitchen Order Tickets (KDS / KOT)",
    description: "Fire orders to kitchen preparation printers or digital KDS screens.",
    category: "dining",
    icon: ChefHat,
  },
  {
    key: "split_check",
    label: "Split Checks & Shared Bills",
    description: "Split receipts equally, by item, or divide payments across multiple customers.",
    category: "dining",
    icon: Layers,
  },
  // Enterprise & Services
  {
    key: "concessionaire_accounting",
    label: "Concessionaire & Vendor Accounting",
    description: "Track multi-tenant brand items and calculate automated mall commission cuts.",
    category: "enterprise",
    icon: Building2,
  },
  {
    key: "staff_commission",
    label: "Staff Commission & Service Attribution",
    description: "Attribute services to stylists or technicians and record tips per staff member.",
    category: "enterprise",
    icon: Users,
  },
];

export function BusinessModeSection() {
  const {
    businessMode,
    modules,
    currentPreset,
    isLoading,
    setBusinessMode,
    toggleModule,
  } = useBusinessMode();

  const [pendingMode, setPendingMode] = useState<BusinessMode | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [togglingKey, setTogglingKey] = useState<keyof ModulesConfig | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    "all" | "health" | "grocery" | "dining" | "enterprise"
  >("all");

  const CurrentIcon = MODE_ICONS[currentPreset.iconName] || Store;

  const handleCardClick = (modeId: BusinessMode) => {
    if (modeId === businessMode) return;
    setPendingMode(modeId);
  };

  const confirmModeSwitch = async () => {
    if (!pendingMode) return;
    setIsSwitching(true);
    try {
      await setBusinessMode(pendingMode);
      setPendingMode(null);
    } catch (err) {
      console.error("Failed to switch business mode:", err);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleToggle = async (key: keyof ModulesConfig) => {
    setTogglingKey(key);
    try {
      await toggleModule(key, !modules[key]);
    } catch (err) {
      console.error("Failed to toggle module:", err);
    } finally {
      setTogglingKey(null);
    }
  };

  const filteredModules =
    activeCategoryFilter === "all"
      ? MODULE_ITEMS
      : MODULE_ITEMS.filter((m) => m.category === activeCategoryFilter);

  if (isLoading) {
    return (
      <div className="bg-card/50 border border-border/50 rounded-2xl p-8 flex items-center justify-center min-h-[220px]">
        <Loader2 className="w-7 h-7 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-border/60 rounded-2xl shadow-xs backdrop-blur-sm overflow-hidden space-y-8 p-6 md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-primary font-bold text-xs uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>Store Operations Architecture</span>
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Business Mode & Feature Modules
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            Configure your store vertical to adapt cashier terminal layouts, product forms, and checkout workflows.
          </p>
        </div>

        {/* Active Mode Pill */}
        <div className="flex items-center gap-2.5 bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl self-start sm:self-auto">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-primary tracking-wider">
              Active Vertical
            </div>
            <div className="text-sm font-bold text-foreground">
              {currentPreset.name}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Select Primary Industry Mode
          </h4>
          <span className="text-xs text-muted-foreground">
            Click any card to switch mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(BUSINESS_MODE_PRESETS) as BusinessMode[]).map((modeKey) => {
            const preset = BUSINESS_MODE_PRESETS[modeKey];
            const Icon = MODE_ICONS[preset.iconName] || Store;
            const isSelected = businessMode === modeKey;

            return (
              <button
                key={modeKey}
                type="button"
                onClick={() => handleCardClick(modeKey)}
                className={`relative text-left p-5 rounded-xl border transition-all duration-200 group cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/25 shadow-sm"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted text-muted-foreground border border-border group-hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/80 border border-border/80 text-muted-foreground">
                        {preset.badge}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h5 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                    {preset.name}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {preset.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary/70 shrink-0" />
                  <span className="truncate">{preset.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modular Feature Toggles */}
      <div className="space-y-5 pt-4 border-t border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Modular Feature Packs
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Turn individual feature packs on or off. Hybrid stores can combine modules from any industry.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-muted/40 border border-border/50 rounded-xl w-fit">
            {[
              { id: "all", label: "All" },
              { id: "health", label: "Pharmacy" },
              { id: "grocery", label: "Grocery" },
              { id: "dining", label: "F&B" },
              { id: "enterprise", label: "Enterprise" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveCategoryFilter(f.id as any)}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                  activeCategoryFilter === f.id
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredModules.map((module) => {
            const ModIcon = module.icon;
            const isEnabled = !!modules[module.key];
            const isToggling = togglingKey === module.key;

            return (
              <div
                key={module.key}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  isEnabled
                    ? "bg-muted/30 border-border/80"
                    : "bg-muted/10 border-border/40 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isEnabled
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    <ModIcon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {module.label}
                      </span>
                      {isEnabled && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  disabled={isToggling}
                  onClick={() => handleToggle(module.key)}
                  aria-label={`Toggle ${module.label}`}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:opacity-50 mt-1 ${
                    isEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    ) : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal for Switching Mode */}
      {pendingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setPendingMode(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-foreground">
                Switch Store to {BUSINESS_MODE_PRESETS[pendingMode]?.name}?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This will update the cashier terminal layout, load recommended module presets for{" "}
                <span className="font-semibold text-foreground">
                  {BUSINESS_MODE_PRESETS[pendingMode]?.name}
                </span>
                , and adapt product catalog fields.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Your data is 100% safe:</strong> Existing products, prices, stock records, and transaction receipts are never deleted when changing business modes.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSwitching}
                onClick={() => setPendingMode(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSwitching}
                onClick={confirmModeSwitch}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                {isSwitching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Switching...
                  </>
                ) : (
                  <>Confirm & Switch</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
