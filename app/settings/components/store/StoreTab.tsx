"use client";

import React from "react";
import { StoreDetailsSection } from "./StoreDetailsSection";
import { StoreAccessSection } from "./StoreAccessSection";
import { StoreSwitcher } from "./StoreSwitcher";
import { usePermissions } from "@/app/hooks/usePermissions";

export const StoreTab = () => {
  const { can_manage_store } = usePermissions();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Store Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure your store identity, localization, and access management.</p>
      </div>

      <StoreSwitcher />

      {can_manage_store && <StoreDetailsSection />}
      
      <StoreAccessSection />
    </div>
  );
};
