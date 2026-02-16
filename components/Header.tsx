"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import Notifications from "@/app/components/Notifications";
import UserProfile from "@/app/components/UserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { useFilterStore } from "@/store/useFilterStore";
import { DateRangeFilter } from "@/components/reusables/DateRangeFilter";

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
  "/cashout": "Cash Management",
};

const THEME_CYCLE = ["light", "dark", "system"] as const;

export default function Header({ onSignInClick, onSignOutClick }: HeaderProps) {
  const { user, isAuthReady } = useAuthStore();
  const { dateRange, setDateRange, resetDateRange } = useFilterStore();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const activeTitle = ROUTE_TITLES[pathname];

  const cycleTheme = () => {
    const currentIndex = THEME_CYCLE.indexOf(
      (theme as (typeof THEME_CYCLE)[number]) ?? "system"
    );
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex]);
  };

  const ThemeIcon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <header className="flex items-center justify-between gap-6 px-6 pt-4">
      {/* LEFT: Spacer for where logo used to be (optional, but keep for balance if needed) */}
      <div className="w-[180px] hidden lg:block shrink-0" />

      <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto gap-8">
        {activeTitle && (
          <h2 className="text-3xl font-bold text-foreground tracking-widest uppercase animate-in fade-in slide-in-from-top-4 duration-500 font-lexend shrink-0">
            {activeTitle}
          </h2>
        )}

        {pathname === "/cashout" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-700">
            <DateRangeFilter
              startDate={dateRange.start}
              endDate={dateRange.end}
              onStartDateChange={(d) => setDateRange({ ...dateRange, start: d })}
              onEndDateChange={(d) => setDateRange({ ...dateRange, end: d })}
              onClear={resetDateRange}
            />
          </div>
        )}
      </div>

      {/* RIGHT: User Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Welcome Text - Subtle */}
        <p className="hidden lg:block text-xs text-muted-foreground text-right">
          {isAuthReady 
            ? (user ? `Welcome, ${user.user_metadata?.first_name || "Admin"}` : "Guest")
            : ""}
        </p>

        {/* Divider */}
        <div className="hidden lg:block w-px h-6 bg-border" />

        {/* Theme Toggle */}
        {mounted && (
          <button
            type="button"
            onClick={cycleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="w-4 h-4" />
          </button>
        )}

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

