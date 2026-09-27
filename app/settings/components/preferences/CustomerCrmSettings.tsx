"use client";

import React, { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Users, UserX, CheckCircle, Ban, Info } from "lucide-react";

export function CustomerCrmSettings() {
  const { isCustomerCrmDisabled, setCustomerCrmDisabled } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for mount
  const isDisabled = mounted ? isCustomerCrmDisabled : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Customer Management (CRM)
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Enable or disable customer relationship management features across the system.
          </p>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 self-start sm:self-center">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isDisabled
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDisabled ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            {isDisabled ? "CRM Disabled" : "CRM Enabled"}
          </span>
        </div>
      </div>

      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 gap-4 ${
          isDisabled
            ? "border-amber-500/30 bg-amber-500/5 shadow-sm"
            : "border-border/50 bg-muted/20 hover:bg-muted/30"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${
              isDisabled
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25"
                : "bg-primary/20 text-primary border-primary/30"
            }`}
          >
            {isDisabled ? <UserX className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>
          <div className="space-y-0.5">
            <p
              className={`text-base font-bold tracking-tight ${
                isDisabled ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              }`}
            >
              {isDisabled ? "Disable Customer (CRM): Active" : "Customer (CRM) Module: Active"}
            </p>
            <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
              {isDisabled
                ? "Customer route (/customers) and customer input fields in the terminal are hidden."
                : "Customer route and terminal customer selector are active and accessible."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCustomerCrmDisabled(!isDisabled)}
          className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all active:scale-[0.98] shrink-0 cursor-pointer ${
            isDisabled
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
              : "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
          }`}
        >
          {isDisabled ? "Enable Customer CRM" : "Disable Customer CRM"}
        </button>
      </div>

      {/* Helpful info box */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-foreground">When Customer (CRM) is disabled:</span>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground/90">
            <li>The <code className="text-primary font-mono text-[11px]">/customers</code> route is removed from the sidebar and navigation.</li>
            <li>Customer selector and customer input fields are removed from the sales terminal.</li>
            <li>The item/barcode input in the terminal expands for faster barcode scanning.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
