"use client";

import React from "react";
import { useCustomerStore } from "../../store/useCustomerStore";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerDetailHeader } from "../details/CustomerDetailHeader";

/**
 * ─── Customer Header Switcher ────────────────────────────────────────────────
 * Switches between the default customer header and the detail view header.
 */
export function CustomerHeaderSwitcher() {
  const { viewMode } = useCustomerStore();
  return viewMode === "detail" ? <CustomerDetailHeader /> : <CustomerHeader />;
}
