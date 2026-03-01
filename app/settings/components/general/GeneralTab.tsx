
import React from "react";
import PermissionsDisplay from "./PermissionsDisplay";
import { ProfilePictureSection } from "./ProfilePictureSection";
import { BusinessInfoSection } from "./BusinessInfoSection";

export const GeneralTab = () => {

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">General Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your personal and business preferences.</p>
            </div>

            {/* Profile Picture Section */}
            <ProfilePictureSection />

            {/* Business Info Section */}
            <BusinessInfoSection />

            {/* Permissions Section */}
            <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
                <PermissionsDisplay />
            </div>

            <div className="flex justify-end pt-4">
                <button className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
                    Save All Changes
                </button>
            </div>
        </div>
    );
};
