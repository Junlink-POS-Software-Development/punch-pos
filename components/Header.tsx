"use client";

import React from "react";
import Image from "next/image";
import SearchBar from "@/app/components/SearchBar";
import Notifications from "@/app/components/Notifications";
import UserProfile from "@/app/components/UserProfile";
import { useAuthStore } from "@/store/useAuthStore";

interface HeaderProps {
  onSignInClick: () => void;
  onSignOutClick: () => void;
}

export default function Header({ onSignInClick, onSignOutClick }: HeaderProps) {
  const { user, isAuthReady } = useAuthStore();

  return (
    <header className="flex items-center justify-between gap-6 mb-6 px-6 pt-4">
      {/* LEFT: Logo Lockup (Visible only if not in Sidebar, but here we keep it or hide it based on design. 
          The plan says Sidebar has logo? No, Sidebar has Menu icon. 
          Let's keep Logo here for now as per design image which shows "Current Cashier" etc, 
          actually the design image shows "Action Panel" on right, and "Current Cashier" on left.
          But the user said: "The header part of the @[app/page.tsx] which contains the "PUNCH POS ..." and the logo... will also persist acrross routes."
      */}
      <div className="flex items-center gap-3 shrink-0">
        <Image
          src="/punch-logo.png"
          alt="PUNCH POS Logo"
          width={48}
          height={48}
          className="object-contain"
        />
        <div className="flex flex-col">
          <h1 className="text-xl tracking-tight animate-text-shine text-white">
            <span className="font-bold">PUNCH</span>
            <span className="font-light text-slate-300"> POS</span>
          </h1>
          <p className="text-[10px] text-slate-500 tracking-wide">
            by JunLink Software Services
          </p>
        </div>
      </div>

      {/* CENTER: Search Bar */}
      <div className="flex-1 flex justify-center max-w-md mx-auto">
        <SearchBar />
      </div>

      {/* RIGHT: User Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Welcome Text - Subtle */}
        <p className="hidden lg:block text-xs text-slate-500 text-right">
          {user
            ? `Welcome, ${user.user_metadata?.first_name || "Admin"}`
            : "Guest"}
        </p>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-slate-700" />

        {/* Notification & Profile Group */}
        <div className="flex items-center gap-3">
          <Notifications />
          {!isAuthReady ? (
            <div className="bg-slate-800 rounded-full w-9 h-9 animate-pulse" />
          ) : (
            <UserProfile
              currentUser={user}
              onSignInClick={onSignInClick}
              onSignOutClick={onSignOutClick}
            />
          )}
        </div>
      </div>
    </header>
  );
}
