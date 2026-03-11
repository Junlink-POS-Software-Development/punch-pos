"use client";

import React from "react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { CustomerDetailView } from "../details/CustomerDetailView";
import { GuestTransactionsTable } from "../tables/GuestTransactionsTable";
import { CustomerTable } from "../tables/CustomerTable";

/**
 * ─── Customer Content Switcher ──────────────────────────────────────────────
 * Switches between the table views (Grouped/Ungrouped) and the detail view.
 */
export function CustomerContentSwitcher() {
  const { selectedGroupId, viewMode } = useCustomerStore();

  // 1. Detail View
  if (viewMode === "detail") {
    return <CustomerDetailView />;
  }

  // 2. Table Views
  return selectedGroupId === "ungrouped" ? (
    <GuestTransactionsTable />
  ) : (
    <CustomerTable />
  );
}
