"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { Lock, Unlock } from "lucide-react";

export default function PriceEditingSettings() {
  const { isPriceEditingEnabled, setPriceEditingEnabled } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Custom Price Editing
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Enable or disable the permission to edit unit prices directly during a sale in the terminal.
        </p>
      </div>

      <div
        className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
          isPriceEditingEnabled
            ? "border-primary bg-primary/10 shadow-sm"
            : "border-border/50 bg-muted/20 hover:bg-muted/30"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${isPriceEditingEnabled ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground border-border/50'}`}>
            {isPriceEditingEnabled ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <p className={`text-base font-bold tracking-tight ${isPriceEditingEnabled ? 'text-primary' : 'text-foreground'}`}>
              {isPriceEditingEnabled ? 'Price Editing Enabled' : 'Price Editing Locked'}
            </p>
            <p className="text-xs font-medium text-muted-foreground/80 mt-0.5 italic">
              {isPriceEditingEnabled 
                ? 'Authorized: Unit prices can be modified by staff' 
                : 'Restricted: Unit prices must match inventory values'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setPriceEditingEnabled(!isPriceEditingEnabled)}
          className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all active:scale-[0.98] ${
            isPriceEditingEnabled
              ? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
          }`}
        >
          {isPriceEditingEnabled ? 'Lock Prices' : 'Enable Edit'}
        </button>
      </div>
    </div>
  );
}
