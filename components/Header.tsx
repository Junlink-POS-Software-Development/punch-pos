"use client";

import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Store } from "lucide-react";
import Notifications from "@/app/components/Notifications";
import UserProfile from "@/app/components/UserProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { useFilterStore } from "@/store/useFilterStore";
import { DateRangeFilter } from "@/components/reusables/DateRangeFilter";
import { getStoreInfo } from "@/app/actions/store";

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

  const [storeInfo, setStoreInfo] = React.useState<{ name: string; img: string | null }>({ name: "", img: null });

  const fetchStoreInfo = React.useCallback(async () => {
    const result = await getStoreInfo();
    if (result.success) {
      setStoreInfo({ name: result.storeName || "", img: result.storeImg || null });
    }
  }, []);

  React.useEffect(() => {
    setMounted(true);
    fetchStoreInfo();

    window.addEventListener("store-updated", fetchStoreInfo);
    return () => window.removeEventListener("store-updated", fetchStoreInfo);
  }, [fetchStoreInfo]);

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
    <header className="flex items-center justify-between gap-6 px-6 pt-4 h-16">
      {/* Container that occupies the whole span between logo area and right actions */}
      <div className="flex-1 hidden lg:flex items-center overflow-hidden h-10 bg-muted/20 border border-border/50 rounded-full px-4 relative group">
        {/* Gradient Masks for premium look */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/20 to-transparent z-10 pointer-events-none" />
        
        <div className="animate-marquee flex items-center flex-nowrap min-w-max gap-20 py-1">
          {/* Repeat content multiple times for seamless infinite loop */}
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-6 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                {storeInfo.img ? (
                  <img src={storeInfo.img} alt="Logo" className="w-5 h-5 object-cover rounded-md shadow-sm" />
                ) : (
                  <Store className="w-5 h-5 text-primary" />
                )}
                <span className="font-black text-sm tracking-tight text-foreground uppercase italic">{storeInfo.name || "PUNCH POS"}</span>
              </div>
              
              {activeTitle && (
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-muted-foreground/60 tracking-[0.4em] uppercase">{activeTitle}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: User Actions */}
      <div className="flex items-center gap-4 shrink-0 ml-auto relative z-20">
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

