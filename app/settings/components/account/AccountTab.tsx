"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ProfileInfoSection } from "./ProfileInfoSection";
import { StoreEnrollmentSection } from "./StoreEnrollmentSection";
import { JoinStoreSection } from "./JoinStoreSection";

const AccountTab = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account security, session, and store enrollment.
        </p>
      </div>

      <ProfileInfoSection />
      <StoreEnrollmentSection />
      <JoinStoreSection />
    </div>
  );
};

export default AccountTab;
