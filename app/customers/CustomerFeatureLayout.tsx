"use client";

import React, { useState } from "react";
import { SWRConfig } from "swr";
import Link from "next/link";
import { ArrowBigLeft, Menu } from "lucide-react";

// Components
import { CustomerSidebar } from "./components/CustomerSidebar";
import { CustomerHeader } from "./components/CustomerHeader";
import { CustomerDetailHeader } from "./components/CustomerDetailHeader";
import { CustomerTable } from "./components/CustomerTable";
import { CustomerDetailView } from "./components/CustomerDetailView";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { RegisterCustomerModal } from "./components/RegisterCustomerModal";
import { GuestTransactionsTable } from "./components/GuestTransactionsTable";

// State & Types
import { useCustomerStore } from "./store/useCustomerStore";
import { CustomerGroup, Customer, GuestTransaction } from "./lib/types";

interface Props {
  initialData: {
    groups: CustomerGroup[];
    customers: Customer[];
    guestTransactions: GuestTransaction[];
  };
}

export default function CustomerFeatureLayout({ initialData }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SWRConfig value={{ fallback: { "customer-feature-data": initialData } }}>
      <div className="flex flex-col bg-gray-900 max-w-screen h-screen overflow-hidden font-sans text-gray-100">
        {/* Top Nav (Fixed) */}
        <div className="px-6 py-3 border-gray-700 border-b shrink-0">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <ArrowBigLeft size={20} />
              Back to Dashboard
            </Link>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden bg-gray-800 hover:bg-gray-700 p-2 rounded-lg text-gray-400 hover:text-white transition"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid lg:grid-cols-[280px_1fr] grid-cols-1 overflow-hidden relative">
          {/* Sidebar Overlay for Mobile */}
          {isSidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar (Fixed on desktop, sliding on mobile) */}
          <div
            className={`
              bg-gray-800 border-gray-700 border-r h-full overflow-hidden
              lg:relative lg:translate-x-0
              fixed inset-y-0 left-0 z-50 w-[280px]
              transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <CustomerSidebar 
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col bg-gray-900 min-w-0 h-full min-h-0">
            {/* Dynamic Header (Fixed) */}
            <div className="z-10 bg-gray-900 border-gray-700 border-b w-full min-h-24 h-auto">
              <HeaderSwitcher />
            </div>

            {/* Dynamic Content (Scrollable Container) */}
            {/* Removed p-6 here so scrollbars hit the edge of the screen */}
            <div className="flex-1 bg-gray-900 min-h-0 overflow-hidden">
              <ContentSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal />
      <RegisterCustomerModal />
    </SWRConfig>
  );
}

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

const HeaderSwitcher = () => {
  const { viewMode } = useCustomerStore();
  return viewMode === "detail" ? <CustomerDetailHeader /> : <CustomerHeader />;
};

const ContentSwitcher = () => {
  const { selectedGroupId, viewMode } = useCustomerStore();

  // 1. Detail View - Handles its own scroll and padding internally
  if (viewMode === "detail") {
    return <CustomerDetailView />;
  }

  // 2. Table Views - Wrapped in a container to maintain the padding we removed from the layout
  return (
    <div className="p-6 h-full overflow-hidden">
      {selectedGroupId === "ungrouped" ? (
        <GuestTransactionsTable />
      ) : (
        <CustomerTable />
      )}
    </div>
  );
};
