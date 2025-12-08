"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export default function LowStockSettings() {
  const { lowStockThreshold, setLowStockThreshold } = useSettingsStore();
  const [localValue, setLocalValue] = useState<string>(lowStockThreshold.toString());

  useEffect(() => {
    setLocalValue(lowStockThreshold.toString());
  }, [lowStockThreshold]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    const parsed = parseInt(newValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setLowStockThreshold(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(localValue, 10);
    if (isNaN(parsed) || parsed < 0) {
      // Revert to context value if invalid on blur
      setLocalValue(lowStockThreshold.toString());
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
        <div className="flex justify-center items-center bg-orange-500/10 rounded-lg w-10 h-10 text-orange-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-white">Inventory Alerts</h2>
          <p className="text-slate-400 text-sm">Manage low stock notifications</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label className="block mb-2 font-medium text-slate-400 text-sm">
            Global Low Stock Threshold
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              value={localValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className="bg-slate-800/50 focus:bg-slate-800 border border-slate-700 focus:border-cyan-500/50 px-4 py-3 rounded-xl w-full sm:w-32 text-slate-200 transition-all outline-none"
            />
            <p className="text-slate-500 text-sm">
              Items with stock below this value will be flagged as low stock, unless overridden by item-specific settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
