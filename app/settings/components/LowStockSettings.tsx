// LowStockSettings.tsx

"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { AlertTriangle, Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function LowStockSettings() {
  const { lowStockThreshold, setLowStockThreshold } = useSettingsStore();
  const [localValue, setLocalValue] = useState<string>(lowStockThreshold.toString());

  // Sync local state if store changes externally
  useEffect(() => {
    setLocalValue(lowStockThreshold.toString());
  }, [lowStockThreshold]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleSave = () => {
    const parsed = parseInt(localValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setLowStockThreshold(parsed);
      alert("Settings saved successfully!"); 
    } else {
      // Reset if invalid
      setLocalValue(lowStockThreshold.toString());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex justify-center items-center bg-amber-500/10 rounded-xl w-12 h-12 text-amber-500 border border-amber-500/20 shadow-inner">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Inventory Alerts</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage low stock notifications and thresholds.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
            Global Low Stock Threshold
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1">
                <input
                type="number"
                min="0"
                value={localValue}
                onChange={handleChange}
                className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 h-[48px] text-foreground"
                />
            </div>
            
            <button 
                onClick={handleSave}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 px-8 py-3 rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.98] shadow-lg shadow-primary/20 h-[48px]"
            >
                <Save className="w-4 h-4" />
                Save Threshold
            </button>
          </div>
          <p className="mt-3 text-muted-foreground text-xs leading-relaxed italic">
            Items with stock levels strictly below this value will be flagged. This serves as the system-wide default.
          </p>
        </div>
      </div>
    </div>
  );
}