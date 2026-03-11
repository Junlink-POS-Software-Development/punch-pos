"use client";

import React from "react";

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
  const { viewMode, isTableExpanded, setIsTableExpanded } = useCustomerStore();

  // Initialize data with hydration
  useCustomerData({ initialData });

  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== "list") return;

    // Find the scrollable container
    const scrollable = (e.target as HTMLElement).closest('.custom-scrollbar');
    const scrollTop = scrollable ? scrollable.scrollTop : 0;

    if (e.deltaY > 10 && !isTableExpanded) {
      setIsTableExpanded(true);
    } else if (e.deltaY < -10 && isTableExpanded && scrollTop <= 5) {
      setIsTableExpanded(false);
    }
  };

  return (
    <div className="flex flex-col bg-background w-full h-screen overflow-hidden font-sans text-foreground">
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === "list" ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Collapsible Header/Stats section */}
            <div 
              className={`transition-all duration-700 ease-in-out shrink-0 overflow-hidden ${
                isTableExpanded 
                  ? "max-h-0 opacity-0 pointer-events-none" 
                  : "max-h-[800px] opacity-100 p-6 lg:p-8 space-y-6 pb-2"
              }`}
            >
              {/* Page Header */}
              <CustomerHeaderSwitcher />

              {/* KPI Cards */}
              <CustomerKpiCards />
            </div>

            {/* Toolbar section - stays visible but can be adjusted */}
            <div className={`transition-all duration-500 px-6 lg:px-8 ${isTableExpanded ? 'py-2 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-20' : 'pb-4'}`}>
              <CustomerToolbar />
            </div>

            {/* Table section - flexes to fill remaining space */}
            <div 
              onWheel={handleWheel}
              className={`flex-1 min-h-0 px-6 lg:px-8 pb-6 lg:pb-8 transition-all duration-500 ${isTableExpanded ? 'px-0 pb-0 lg:px-0 lg:pb-0' : ''}`}
            >
              <CustomerContentSwitcher />
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
