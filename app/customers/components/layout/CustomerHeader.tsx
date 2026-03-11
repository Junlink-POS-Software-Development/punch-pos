"use client";

import React from "react";
import { UserPlus, Download } from "lucide-react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { useCustomerData } from "../../hooks/useCustomerData";
import { usePermissions } from "@/app/hooks/usePermissions";

/**
 * ─── Customer Header ────────────────────────────────────────────────────────
 * Page-level header with title, subtitle, and action buttons.
 */
export function CustomerHeader() {
  const { rawCustomers } = useCustomerData();
  const openCustomerModal = useCustomerStore((s) => s.openCustomerModal);
  const { can_manage_customers } = usePermissions();

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 className="font-bold text-foreground text-2xl lg:text-3xl tracking-tight">
          Customers
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your customer relationships and loyalty.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Export Button */}
        <button
          className="flex items-center gap-2 bg-card border border-border hover:bg-accent px-4 py-2.5 rounded-xl text-sm font-medium text-foreground transition-all"
        >
          <Download size={16} className="text-muted-foreground" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Add Customer Button */}
        {can_manage_customers && (
          <button
            onClick={openCustomerModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
          >
            <UserPlus size={18} className="shrink-0" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </div>
  );
}
