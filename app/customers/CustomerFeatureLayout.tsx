"use client";

import { SWRConfig } from "swr";
import { CustomerSidebar } from "./components/CustomerSidebar";
import { CustomerHeader } from "./components/CustomerHeader";
import { CustomerTable } from "./components/CustomerTable";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { RegisterCustomerModal } from "./components/RegisterCustomerModal";
import { GuestTransactionsTable } from "./components/GuestTransactionsTable"; // Import
import { useCustomerStore } from "./store/useCustomerStore";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";

import { CustomerGroup, Customer, GuestTransaction } from "./lib/types";

interface Props {
  initialData: {
    groups: CustomerGroup[];
    customers: Customer[];
    guestTransactions: GuestTransaction[]; // Added type
  };
}

export default function CustomerFeatureLayout({ initialData }: Props) {
  return (
    <SWRConfig value={{ fallback: { "customer-feature-data": initialData } }}>
      <div className="flex flex-col bg-gray-900 max-w-screen h-screen overflow-hidden font-sans text-gray-100">
        {/* Top Nav */}
        <div className="px-6 py-3 border-gray-700 border-b">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowBigLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-16 overflow-hidden">
          {/* Sidebar */}
          <div className="col-span-4 bg-gray-800 border-gray-700 border-r h-full">
            <CustomerSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col col-span-12 bg-gray-900 min-w-0 h-full">
            <div className="z-10 w-full h-20">
              <CustomerHeader />
            </div>

            <div className="relative flex-1 p-6 overflow-hidden">
              {/* CONDITIONAL RENDERING 
                  We use a separate wrapper component to check the store state 
                  so we don't have to make this entire Layout 'use client' (if strictly separating).
                  Since this file is already 'use client', we can use the store logic directly here 
                  or via a sub-component. A sub-component is cleaner.
               */}
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

// Sub-component to handle the view toggle
const ContentSwitcher = () => {
  const { selectedGroupId } = useCustomerStore();

  if (selectedGroupId === "ungrouped") {
    // Show Guest Table
    return <GuestTransactionsTable />;
  }

  // Default: Show Registered Customers Table
  return <CustomerTable />;
};
