"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import { SettingsSidebar } from "./components/sidebar/SettingsSidebar";
import { GeneralTab } from "./components/tabs/GeneralTab";
import AccountSettings from "./components/AccountSettings";
import { SystemConfigTab } from "./components/tabs/SystemConfigTab";
import { AuditLogsTab } from "./components/tabs/AuditLogsTab";

type TabId = "general" | "account" | "system" | "audit";

function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("reason") === "store_deleted") {
      setShowBanner(true);
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab />;
      case "account":
        return <AccountSettings />;
      case "system":
        return <SystemConfigTab />;
      case "audit":
        return <AuditLogsTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden text-foreground font-lexend relative">
      {/* Sidebar - Fixed height and scrollable if needed */}
      <div className="lg:w-72 shrink-0 lg:border-r border-border p-6 lg:p-8 bg-card/30 h-full overflow-y-auto overflow-x-hidden flex flex-col">
        <div className="mb-10">
           <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
           <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Manage your account and system preferences</p>
        </div>
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content Area - Independently scrollable */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto h-full scroll-smooth">
        {showBanner && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4 text-destructive">
                <div className="bg-destructive/20 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                </div>
                <div>
                <h3 className="font-bold text-base">Store Access Removed</h3>
                <p className="text-sm opacity-90">
                    The store you were accessing has been closed. Please join a different store.
                </p>
                </div>
            </div>
            <button 
                onClick={() => setShowBanner(false)}
                className="p-1.5 hover:bg-destructive/20 rounded-lg transition-colors text-destructive shrink-0"
            >
                <X className="w-5 h-5" />
            </button>
            </div>
        )}

        <div className="max-w-4xl animate-in fade-in zoom-in-95 duration-300">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
