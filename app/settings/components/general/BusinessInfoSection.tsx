"use client";

import React from "react";
import CurrencySelector from "./CurrencySelector";
import { useAuthStore } from "@/store/useAuthStore";

export function BusinessInfoSection() {
  const { user } = useAuthStore();

  return (
    <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Business Name</label>
            <input 
                type="text" 
                defaultValue="JunLink POS"
                className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
            />
        </div>
        <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">Email Address</label>
            <input 
                type="email" 
                defaultValue={user?.email || "admin@junlink.com"}
                disabled
                className="w-full bg-muted/40 border border-border/30 rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed italic"
            />
        </div>
      </div>

      <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">System Timezone</label>
          <div className="relative">
            <select className="w-full appearance-none bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                <option>Asia/Manila (GMT+8)</option>
                <option>America/New_York (GMT-5)</option>
                <option>Europe/London (GMT+0)</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-foreground/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
          </div>
      </div>

      <div className="pt-4 border-t border-border/30">
          <CurrencySelector />
      </div>
    </div>
  );
}
