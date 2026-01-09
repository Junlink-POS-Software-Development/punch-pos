"use client";

import { SWRConfig } from "swr";
import { CustomerSidebar } from "./components/CustomerSidebar";
import { CustomerHeader } from "./components/CustomerHeader";
import { CustomerTable } from "./components/CustomerTable";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { RegisterCustomerModal } from "./components/RegisterCustomerModal";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";

// Import types for fallback data
import { CustomerGroup, Customer } from "./lib/types";

interface Props {
  initialData: {
    groups: CustomerGroup[];
    customers: Customer[];
  };
}

export default function CustomerFeatureLayout({ initialData }: Props) {
  return (
    <SWRConfig value={{ fallback: { "customer-feature-data": initialData } }}>
      {/* Changed to a flex column layout so the 'Back' link 
         sits entirely above the sidebar/content grid.
      */}
      <div className="flex flex-col bg-gray-900 max-w-screen h-screen overflow-hidden font-sans text-gray-100">
        {/* Top Navigation Bar (Outside the grid) */}
        <div className="px-6 py-3 border-gray-700 border-b">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowBigLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Lower Section: Sidebar and Main Content */}
        <div className="flex-1 grid grid-cols-16 overflow-hidden">
          {/* Sidebar */}
          <div className="col-span-4 bg-gray-800 border-gray-700 border-r h-full">
            <CustomerSidebar />
          </div>

          {/* Main Content */}
          <div className="flex flex-col col-span-12 bg-gray-900 min-w-0 h-full">
            <div className="z-10 w-full h-20">
              <CustomerHeader />
            </div>
            <div className="relative flex-1 p-6 md:p-8 overflow-y-auto">
              <CustomerTable />
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreateGroupModal />
        <RegisterCustomerModal />
      </div>
    </SWRConfig>
  );
}
