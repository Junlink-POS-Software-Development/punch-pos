"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchBar from "@/app/components/SearchBar";
import Notifications from "@/app/components/Notifications";
import UserProfile from "@/app/components/UserProfile";
import { useAuthStore } from "@/store/useAuthStore";

interface HeaderProps {
  onSignInClick: () => void;
  onSignOutClick: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  "/inventory": "Inventory Management",
  "/dashboard": "Dashboard Overview",
  "/transactions": "Transaction History",
  "/expenses": "Expense Tracker",
  "/customers": "Customer Relations",
  "/settings": "System Settings",
  "/maintenance": "Database Maintenance",
  "/google-workspace": "Google Workspace",
};

export default function Header({ onSignInClick, onSignOutClick }: HeaderProps) {
  const { user, isAuthReady } = useAuthStore();
  const pathname = usePathname();

  const activeTitle = ROUTE_TITLES[pathname];

  return (
    <header className="flex items-center justify-between gap-6 mb-6 px-6 pt-4">
      {/* LEFT: Logo Lockup */}
      <div className="flex items-center gap-3 shrink-0">
        <Image
          src="/punch-logo.png"
          alt="PUNCH POS Logo"
          width={48}
          height={48}
          className="object-contain"
        />
        <div className="flex flex-col">
          <h1 className="text-xl tracking-tight animate-text-shine text-foreground">
            <span className="font-bold">PUNCH</span>
            <span className="font-light text-muted-foreground"> POS</span>
          </h1>
          <p className="text-[10px] text-muted-foreground/70 tracking-wide">
            by JunLink Software Services
          </p>
        </div>
      </div>

      {/* CENTER: Dynamic Title or Search Bar */}
      <div className="flex-1 flex justify-center max-2-2xl mx-auto">
        {activeTitle ? (
          <h2 className="text-3xl font-bold text-foreground tracking-widest uppercase animate-in fade-in slide-in-from-top-4 duration-500 font-lexend">
            {activeTitle}
          </h2>
        ) : (
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        )}
      </div>

      {/* RIGHT: User Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Welcome Text - Subtle */}
        <p className="hidden lg:block text-xs text-muted-foreground text-right">
          {user
            ? `Welcome, ${user.user_metadata?.first_name || "Admin"}`
            : "Guest"}
        </p>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-border" />

        {/* Notification & Profile Group */}
        <div className="flex items-center gap-3">
          <Notifications />
          {!isAuthReady ? (
            <div className="bg-muted rounded-full w-9 h-9 animate-pulse" />
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
