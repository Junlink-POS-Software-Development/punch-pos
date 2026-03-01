"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, Mail } from "lucide-react";

export function ProfileInfoSection() {
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  return (
    <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-8">
        <div className="flex items-center gap-5">
          <div className="bg-primary/10 p-4 border border-primary/20 rounded-full text-primary shadow-inner">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
              Active Email Address
            </p>
            <p className="font-semibold text-foreground text-lg">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="flex justify-center items-center gap-2 bg-destructive/10 hover:bg-destructive/20 px-6 py-3 border border-destructive/20 rounded-xl font-bold text-destructive active:scale-[0.98] transition-all shadow-sm"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
