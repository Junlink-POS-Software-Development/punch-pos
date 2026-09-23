"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { getStoreInfo } from "@/app/actions/store";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import { getNavItems, isShortcutActive, NavItemConfig } from "./navConfig";
import { ContextualSubNav } from "./ContextualSubNav";

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isRestaurant, modules } = useBusinessMode();
  const showKitchenKds = isRestaurant || modules.kitchen_display;
  const { posMode, recordSidebarInteraction } = useViewStore();
  const isTabletMode = posMode === "tablet";

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [expandedDrawerItemIds, setExpandedDrawerItemIds] = useState<Record<string, boolean>>({});
  const [storeInfo, setStoreInfo] = useState<{ name: string; img: string | null }>({
    name: "",
    img: null,
  });

  // Close drawer during render on route change (recommended React pattern)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMoreOpen(false);
  }

  useEffect(() => {
    let isMounted = true;
    const loadStore = async () => {
      const result = await getStoreInfo();
      if (isMounted && result?.success) {
        setStoreInfo({ name: result.storeName || "", img: result.storeImg || null });
      }
    };
    void loadStore();
    window.addEventListener("store-updated", loadStore);
    return () => {
      isMounted = false;
      window.removeEventListener("store-updated", loadStore);
    };
  }, []);

  const navItems = getNavItems(showKitchenKds);

  // Primary 4 tabs on the bottom bar: terminal, dashboard, inventory, transactions
  const primaryTabIds = ["terminal", "dashboard", "inventory", "transactions"];
  const primaryTabs = primaryTabIds
    .map((id) => navItems.find((item) => item.id === id))
    .filter(Boolean) as NavItemConfig[];

  // Secondary items accessed through "More"
  const secondaryItems = navItems.filter(
    (item) => !primaryTabIds.includes(item.id)
  );

  const isMoreActive = secondaryItems.some((item) =>
    pathname.startsWith(item.href)
  );

  const toggleDrawerItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedDrawerItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Visibility class: If in tablet touch mode, show on all screens; otherwise show on < lg only
  const visibilityClass = isTabletMode ? "" : "lg:hidden";

  return (
    <>
      {/* Contextual Sub-Navigation Bar above Bottom Bar */}
      <ContextualSubNav />

      {/* Slide-up "More" Drawer Backdrop */}
      {isMoreOpen && (
        <div
          className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ${visibilityClass}`}
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* Slide-up "More" Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-card p-5 shadow-2xl transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto ${visibilityClass} ${
          isMoreOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
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
              <p className="text-xs text-muted-foreground">More features & sub-sections</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMoreOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Grid / List with Expandable Sub-Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {secondaryItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const hasShortcuts = Boolean(item.shortcuts && item.shortcuts.length > 0);
            const isItemExpanded = Boolean(expandedDrawerItemIds[item.id]);

            return (
              <div
                key={item.id}
                className={`flex flex-col rounded-xl border transition-colors ${
                  isActive
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-border/60 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between p-3">
                  <Link
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <item.Icon className="h-5 w-5" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-sm flex items-center gap-1.5 truncate text-foreground">
                        {item.text}
                        {item.hasNotification && (
                          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.desc || (hasShortcuts ? `${item.shortcuts?.length} sections` : item.text)}
                      </div>
                    </div>
                  </Link>

                  {hasShortcuts ? (
                    <button
                      type="button"
                      onClick={(e) => toggleDrawerItem(item.id, e)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors ml-2"
                      title={isItemExpanded ? "Hide sub-sections" : "Show sub-sections"}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isItemExpanded ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  )}
                </div>

                {/* Sub-sections list in More drawer */}
                {hasShortcuts && isItemExpanded && (
                  <div className="border-t border-border/50 px-3 py-2 bg-background/60 rounded-b-xl flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 pt-1">
                      Sub Sections
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.shortcuts?.map((shortcut, idx) => {
                        const active = isShortcutActive(shortcut, pathname, searchParams);
                        return (
                          <Link
                            key={idx}
                            href={shortcut.href}
                            target={shortcut.isExternal ? "_blank" : undefined}
                            rel={shortcut.isExternal ? "noopener noreferrer" : undefined}
                            onClick={() => setIsMoreOpen(false)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            }`}
                          >
                            {shortcut.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet Bottom Navigation Bar */}
      <nav
        onClick={recordSidebarInteraction}
        onTouchStart={recordSidebarInteraction}
        className={`fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card/95 px-2 backdrop-blur-md shadow-lg ${visibilityClass}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {primaryTabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href) && tab.href !== "/";
          const hasShortcuts = Boolean(tab.shortcuts && tab.shortcuts.length > 0);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-all duration-200 active:scale-95 relative ${
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                  isActive ? "bg-primary/15 scale-110" : ""
                }`}
              >
                <tab.Icon className="h-5 w-5" />
              </div>
              <span className="mt-0.5 tracking-tight truncate max-w-[64px]">
                {tab.text}
              </span>

              {/* Dot indicator if tab has sub-sections */}
              {hasShortcuts && (
                <span
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    isActive ? "bg-primary" : "bg-muted-foreground/40"
                  }`}
                />
              )}
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          type="button"
          onClick={() => {
            recordSidebarInteraction();
            setIsMoreOpen(!isMoreOpen);
          }}
          className={`flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-all duration-200 active:scale-95 cursor-pointer ${
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
