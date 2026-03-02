"use client";

import React from "react";
import { LogOut, ShieldEllipsis, KeyRound } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function AccountActionsSection() {
  const { signOut } = useAuthStore();

  return (
    <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-destructive/10 rounded-xl text-destructive">
            <ShieldEllipsis className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-foreground leading-none">Security & Account</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage your account access and session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
            className="flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all text-left group"
        >
            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <KeyRound className="w-4 h-4" />
            </div>
            <div>
                <span className="block font-bold text-sm">Update Password</span>
                <span className="block text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Change security key</span>
            </div>
        </button>

        <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 px-6 py-4 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-xl transition-all text-left"
        >
            <div className="p-2 bg-destructive/20 rounded-lg text-destructive">
                <LogOut className="w-4 h-4" />
            </div>
            <div>
                <span className="block font-bold text-sm text-destructive">Sign Out Session</span>
                <span className="block text-[10px] text-destructive/60 uppercase tracking-widest mt-0.5">End active session</span>
            </div>
        </button>
      </div>
    </div>
  );
}
