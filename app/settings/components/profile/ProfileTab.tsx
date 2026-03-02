"use client";

import React from "react";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { AccountActionsSection } from "./AccountActionsSection";
import PermissionsDisplay from "./PermissionsDisplay";

export const ProfileTab = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information and account security.</p>
      </div>

      <PersonalInfoSection />
      
      <div className="bg-card/50 p-8 border border-border rounded-2xl shadow-sm backdrop-blur-sm">
        <PermissionsDisplay />
      </div>

      <AccountActionsSection />
    </div>
  );
};
