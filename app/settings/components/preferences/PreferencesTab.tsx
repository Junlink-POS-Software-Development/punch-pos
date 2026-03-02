"use client";

import React from "react";
import VoucherSettings from "./VoucherSettings";
import LowStockSettings from "./LowStockSettings";
import PriceEditingSettings from "./PriceEditingSettings";
import BackdateSettings from "../../backdating/BackdatingSettings";

export const PreferencesTab = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">System Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure automated behaviors and system modules.</p>
      </div>

      <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
        <BackdateSettings />
      </div>

      <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
        <VoucherSettings />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
          <LowStockSettings />
        </div>
        
        <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
          <PriceEditingSettings />
        </div>
      </div>
    </div>
  );
};
