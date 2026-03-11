"use client";

import React, { useMemo } from "react";

// Components
import { CustomerHeaderSwitcher } from "./components/layout/CustomerHeaderSwitcher";
import { CustomerContentSwitcher } from "./components/layout/CustomerContentSwitcher";
import { CustomerKpiCards } from "./components/layout/CustomerKpiCards";
import { CustomerToolbar } from "./components/layout/CustomerToolbar";
import { CreateGroupModal } from "./components/modals/CreateGroupModal";
import { RegisterCustomerModal } from "./components/modals/RegisterCustomerModal";
import { ManageGroupsModal } from "./components/modals/ManageGroupsModal";

// State & Types
import { CustomerGroup, Customer, GuestTransaction } from "./lib/types";
import { useCustomerData } from "./hooks/useCustomerData";
import { useCustomerStore } from "./store/useCustomerStore";

interface CustomerFeatureLayoutProps {
  initialData: {
    groups: CustomerGroup[];
    customers: Customer[];
    guestTransactions: GuestTransaction[];
  };
}

/**
 * ─── Customer Feature Layout ────────────────────────────────────────────────
 * Full-width dashboard layout for the customer management feature.
 */
export function CustomerFeatureLayout({ initialData }: CustomerFeatureLayoutProps) {
  const { viewMode, isHeaderCollapsed } = useCustomerStore();

  // Initialize data with hydration
  useCustomerData({ initialData });

  // Memoize components to prevent re-renders when isHeaderCollapsed changes
  const MemoizedHeader = useMemo(() => <CustomerHeaderSwitcher />, []);
  const MemoizedKpiCards = useMemo(() => <CustomerKpiCards />, []);
  const MemoizedToolbar = useMemo(() => <CustomerToolbar />, []);
  const MemoizedContent = useMemo(() => <CustomerContentSwitcher />, []);

  return (
    <div className="flex flex-col bg-background w-full h-screen overflow-hidden font-sans text-foreground">
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === "list" ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Collapsible Header/Stats section */}
            <div className={`px-6 lg:px-8 space-y-6 shrink-0 transition-all duration-500 ease-in-out will-change-[max-height,opacity,transform] overflow-hidden ${
              isHeaderCollapsed 
                ? "max-h-0 opacity-0 pt-0 pb-0 scale-95 pointer-events-none" 
                : "max-h-[600px] opacity-100 pt-6 lg:pt-8 pb-2 scale-100"
            }`}>
              {/* Page Header */}
              {MemoizedHeader}

              {/* KPI Cards */}
              {MemoizedKpiCards}
            </div>

            {/* Toolbar section - usually stays visible */}
            <div className={`px-6 lg:px-8 pb-4 shrink-0 transition-all duration-300 ${isHeaderCollapsed ? "pt-4" : "pt-0"}`}>
              {MemoizedToolbar}
            </div>

            {/* Table section - flexes to fill remaining space */}
            <div className="flex-1 min-h-0 px-6 lg:px-8 pb-6 lg:pb-8">
              {MemoizedContent}
            </div>
          </div>
        ) : (
          /* Detail View — full height */
          <div className="flex flex-col h-full">
            <div className="border-b border-border bg-background z-10 min-h-16">
              <CustomerHeaderSwitcher />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <CustomerContentSwitcher />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal />
      <RegisterCustomerModal />
      <ManageGroupsModal />
    </div>
  );
}
