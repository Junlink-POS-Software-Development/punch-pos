"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Terminal,
  LayoutGrid,
  Archive,
  ArrowLeftRight,
  Menu,
  X,
  TrendingDown,
  Users,
  Grid,
  Inbox,
  StickyNote,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getStoreInfo } from "@/app/actions/store";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState<{ name: string; img: string | null }>({
    name: "",
    img: null,
  });

  const fetchStoreInfo = async () => {
    const result = await getStoreInfo();
    if (result?.success) {
      setStoreInfo({ name: result.storeName || "", img: result.storeImg || null });
    }
  };

  useEffect(() => {
    fetchStoreInfo();
    const handleUpdate = () => fetchStoreInfo();
    window.addEventListener("store-updated", handleUpdate);
    return () => window.removeEventListener("store-updated", handleUpdate);
  }, []);

  // Close drawer on navigation
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Primary 4 tabs on the bottom bar
  const primaryTabs = [
    {
      id: "terminal",
      label: "Terminal",
      href: "/",
      icon: Terminal,
      isActive: pathname === "/",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      id: "inventory",
      label: "Inventory",
      href: "/inventory",
      icon: Archive,
      isActive: pathname.startsWith("/inventory"),
    },
    {
      id: "transactions",
      label: "Transactions",
      href: "/transactions",
      icon: ArrowLeftRight,
      isActive: pathname.startsWith("/transactions"),
    },
  ];

  // Secondary items accessed through "More"
  const secondaryItems = [
    {
      id: "cashout",
      label: "Cash Out",
      desc: "Record expenses & cashflow",
      href: "/cashout",
      icon: TrendingDown,
    },
    {
      id: "customers",
      label: "Customers",
      desc: "Manage customer directory",
      href: "/customers",
      icon: Users,
    },
    {
      id: "google-workspace",
      label: "Workspace",
      desc: "Gmail, Drive & Calendar",
      href: "/google-workspace",
      icon: Grid,
    },
    {
      id: "inbox",
      label: "Inbox",
      desc: "Messages and alerts",
      href: "/inbox",
      icon: Inbox,
      hasNotification: true,
    },
    {
      id: "notes",
      label: "Notes & Tasks",
      desc: "Quick memos and checklist",
      href: "/notes",
      icon: StickyNote,
      hasNotification: true,
    },
    {
      id: "settings",
      label: "Settings",
      desc: "Store profile & preferences",
      href: "/settings",
      icon: Settings,
    },
  ];

  const isMoreActive = secondaryItems.some((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <>
      {/* Slide-up "More" Drawer Backdrop */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-200 lg:hidden"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* Slide-up "More" Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-card p-5 shadow-2xl transition-transform duration-300 ease-out lg:hidden max-h-[85vh] overflow-y-auto ${
          isMoreOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

        {/* Drawer Header */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            {storeInfo.img ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-border">
                <img
                  src={storeInfo.img}
                  alt={storeInfo.name || "Store"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Image
                src="/punch-logo.png"
                alt="PUNCH POS"
                width={32}
                height={32}
                className="object-contain"
              />
            )}
            <div>
              <h3 className="text-base font-bold text-foreground">
                {storeInfo.name || "PUNCH POS"}
              </h3>
              <p className="text-xs text-muted-foreground">More features & tools</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMoreOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Grid / List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {secondaryItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMoreOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-muted/60 text-foreground border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-sm flex items-center gap-1.5 truncate">
                      {item.label}
                      {item.hasNotification && (
                        <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card/95 px-2 backdrop-blur-md shadow-lg lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {primaryTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-all duration-200 active:scale-95 ${
              tab.isActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                tab.isActive ? "bg-primary/15 scale-110" : ""
              }`}
            >
              <tab.icon className="h-5 w-5" />
            </div>
            <span className="mt-0.5 tracking-tight truncate max-w-[64px]">
              {tab.label}
            </span>
          </Link>
        ))}

        {/* More Tab */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-all duration-200 active:scale-95 ${
            isMoreActive || isMoreOpen
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
              isMoreActive || isMoreOpen ? "bg-primary/15 scale-110" : ""
            }`}
          >
            <Menu className="h-5 w-5" />
          </div>
          <span className="mt-0.5 tracking-tight">More</span>
        </button>
      </nav>
    </>
  );
}
