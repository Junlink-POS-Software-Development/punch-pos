"use client";

import React from "react";
import SubscriptionSettings from "./SubscriptionSettings";

export const SubscriptionTab = () => {
    return (
        <div className="space-y-8">
             <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Subscription & Billing</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage your plan and billing information.</p>
            </div>
            
             <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
                <SubscriptionSettings />
            </div>
        </div>
    );
};
