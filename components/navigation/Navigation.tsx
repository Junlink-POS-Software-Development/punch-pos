// components/navigation/Navigation.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useViewStore } from "../window-layouts/store/useViewStore";
import { getStoreInfo } from "@/app/actions/store";
import { DEFAULT_PAYMENT_PAGE_SIZE, formatPaymentRecord } from "@/app/transactions/lib/paymentCache";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import { getNavItems, getActiveNavItem, isShortcutActive } from "./navConfig";

interface NavigationProps {
  variant?: "grid" | "sidebar";
}

const Navigation = React.memo(({ variant = "grid" }: NavigationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isSidebarCollapsed, setSidebarCollapsed, toggleSidebar, posMode, recordSidebarInteraction } = useViewStore();
  const isTabletMode = posMode === "tablet";
  const { isRestaurant, modules } = useBusinessMode();
  const showKitchenKds = isRestaurant || modules.kitchen_display;

  // Track which sub-sections are open in expanded mode
  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>({});
  // Track which item is hovered in collapsed mode for the floating flyout
  const [flyoutItemId, setFlyoutItemId] = useState<string | null>(null);
  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = React.useMemo(() => getNavItems(showKitchenKds), [showKitchenKds]);

  // Handle mouse enter on sidebar: cancel any pending auto-close timer (do NOT auto-open)
  const handleSidebarEnter = () => {
    recordSidebarInteraction();
    if (sidebarLeaveTimeoutRef.current) {
      clearTimeout(sidebarLeaveTimeoutRef.current);
      sidebarLeaveTimeoutRef.current = null;
    }
  };

  // Handle mouse leave on sidebar: auto-collapse sidebar if currently expanded
  const handleSidebarLeave = () => {
    if (sidebarLeaveTimeoutRef.current) {
      clearTimeout(sidebarLeaveTimeoutRef.current);
    }
    if (!isSidebarCollapsed) {
      sidebarLeaveTimeoutRef.current = setTimeout(() => {
        setSidebarCollapsed(true);
        setFlyoutItemId(null);
      }, 250);
    }
  };

  useEffect(() => {
    return () => {
      if (sidebarLeaveTimeoutRef.current) {
        clearTimeout(sidebarLeaveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-expand the currently active section on route change
  useEffect(() => {
    const active = getActiveNavItem(pathname, navItems);
    if (active && active.shortcuts && active.shortcuts.length > 0) {
      setOpenSectionIds((prev) => ({ ...prev, [active.id]: true }));
    }
  }, [pathname, navItems]);

  const prewarmPayments = () => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ["payments", DEFAULT_PAYMENT_PAGE_SIZE, { startDate: "", endDate: "" }],
      queryFn: async () => {
        const { getPaymentHistory } = await import("@/app/actions/transactions");
        const res = await getPaymentHistory(1, DEFAULT_PAYMENT_PAGE_SIZE, {});
        if (!res.success) throw new Error(res.error);
        const rows = res.data || [];
        return {
          data: rows.map(formatPaymentRecord),
          count: res.count || 0,
          nextPage: rows.length === DEFAULT_PAYMENT_PAGE_SIZE ? 2 : undefined,
        };
      },
      initialPageParam: 1,
      staleTime: 1000 * 60 * 5,
    }).catch(() => {});
  };

  // Flyout handlers for collapsed mode only
  const handleFlyoutEnter = (id: string) => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    if (isSidebarCollapsed) {
      setFlyoutItemId(id);
    }
    if (id === "transactions") {
      prewarmPayments();
    }
  };

  const handleFlyoutLeave = () => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    flyoutTimeoutRef.current = setTimeout(() => {
      setFlyoutItemId(null);
    }, 150);
  };

  // Store logo/name for sidebar
  const [storeInfo, setStoreInfo] = useState<{ name: string; img: string | null }>({ name: "", img: null });

  const fetchStoreInfo = async () => {
    const result = await getStoreInfo();
    if (result.success) {
      setStoreInfo({ name: result.storeName || "", img: result.storeImg || null });
    }
  };

  useEffect(() => {
    if (variant === "sidebar") {
      fetchStoreInfo();

      const handleUpdate = () => fetchStoreInfo();
      window.addEventListener("store-updated", handleUpdate);
      return () => window.removeEventListener("store-updated", handleUpdate);
    }
  }, [variant]);

  // Filter items for Grid view (exclude Terminal)
  const displayItems =
    variant === "grid" ? navItems.filter((item) => !item.hiddenInGrid) : navItems;

  if (variant === "grid") {
    return (
      <nav className="gap-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8 font-lexend">
        {displayItems.map((item) => (
          <div key={item.id} className="group relative">
            <Link
              href={item.href}
              className={`
                relative flex flex-col justify-center items-center p-6 rounded-xl 
                text-primary transition-all duration-300 border border-border
                bg-background shadow-sm hover:shadow-md
                
                group-hover:text-secondary 
                group-hover:border-secondary
                group-hover:bg-muted/50
                
                h-36 w-full
              `}
            >
              {item.hasNotification && (
                <span className="top-4 right-4 absolute bg-red-500 rounded-full w-2.5 h-2.5 animate-pulse" />
              )}

              <item.Icon className="mb-3 w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium text-base tracking-wide text-center">
                {item.text}
              </span>
            </Link>
          </div>
        ))}
      </nav>
    );
  }

  // --- SIDEBAR VARIANT (Desktop) ---
  const isExpanded = !isSidebarCollapsed;

  const toggleSection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    recordSidebarInteraction();
    setOpenSectionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <aside
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
        onMouseMove={recordSidebarInteraction}
        onClick={recordSidebarInteraction}
        onTouchStart={recordSidebarInteraction}
        className={`
          fixed left-0 top-0 z-[60] h-full bg-background border-r border-border transition-all duration-300 ease-in-out shadow-xl hidden lg:flex flex-col select-none
          ${isTabletMode ? "-translate-x-full" : (isSidebarCollapsed ? "lg:w-20" : "lg:w-64")}
        `}
      >
        {/* Toggle Button - Desktop only, never overwritten by hover */}
        {!isTabletMode && (
          <button
            type="button"
            onClick={() => {
              recordSidebarInteraction();
              if (sidebarLeaveTimeoutRef.current) {
                clearTimeout(sidebarLeaveTimeoutRef.current);
                sidebarLeaveTimeoutRef.current = null;
              }
              toggleSidebar();
            }}
            className="top-4 -right-3.5 z-50 absolute flex items-center justify-center bg-background border border-border shadow-md p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden lg:flex cursor-pointer"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Header / Logo Area */}
        <div className="flex items-center h-16 border-b border-border px-4 overflow-hidden shrink-0">
          <div className="flex items-center gap-3 shrink-0">
            {storeInfo.img ? (
              <div className="w-10 h-10 min-w-[40px] rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
                <img
                  src={storeInfo.img}
                  alt={storeInfo.name || "Store Logo"}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <Image
                src="/punch-logo.png"
                alt="PUNCH POS Logo"
                width={40}
                height={40}
                className="object-contain min-w-[40px]"
              />
            )}
            
            {isExpanded && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="text-base font-bold tracking-tight text-foreground leading-none truncate max-w-[160px]">
                  {storeInfo.name || (<>PUNCH<span className="font-light text-muted-foreground ml-1">POS</span></>)}
                </h1>
                {!storeInfo.name && (
                  <p className="text-[8px] text-muted-foreground/70 tracking-wide whitespace-nowrap mt-0.5">
                    by JunLink Software
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 space-y-1.5 overflow-y-auto py-3 px-3 custom-scrollbar">
          {displayItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href) && item.href !== "/";

            const hasShortcuts = Boolean(item.shortcuts && item.shortcuts.length > 0);
            const isOpen = Boolean(openSectionIds[item.id]);
            const isFlyoutOpen = isSidebarCollapsed && flyoutItemId === item.id;

            return (
              <div 
                key={item.id} 
                className="relative flex flex-col gap-0.5"
                onMouseEnter={() => handleFlyoutEnter(item.id)}
                onMouseLeave={handleFlyoutLeave}
              >
                <div className="flex items-center w-full">
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      recordSidebarInteraction();
                      // If expanded and item has shortcuts, ensure section is opened
                      if (isExpanded && hasShortcuts) {
                        if (isActive) {
                          // Already on section, toggle accordion
                          toggleSection(item.id, e);
                        } else {
                          // Navigating to section, ensure it's open
                          setOpenSectionIds((prev) => ({ ...prev, [item.id]: true }));
                        }
                      }
                    }}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 flex-1 min-w-0
                      ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20 font-semibold"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-transparent"
                      }
                      ${!isExpanded ? "justify-center" : ""}
                    `}
                  >
                    <div className="relative shrink-0">
                      <item.Icon
                        className={`
                          w-5 h-5 transition-transform duration-200
                          ${isActive ? "scale-105" : ""}
                        `}
                      />
                      {item.hasNotification && (
                        <span className="top-0 right-0 absolute bg-red-500 shadow-sm rounded-full w-2 h-2" />
                      )}
                    </div>

                    {isExpanded && (
                      <span className="text-sm font-medium tracking-tight truncate flex-1">
                        {item.text}
                      </span>
                    )}
                  </Link>

                  {/* Explicit chevron button when expanded for instant accordion toggle */}
                  {isExpanded && hasShortcuts && (
                    <button
                      type="button"
                      onClick={(e) => toggleSection(item.id, e)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors ml-1"
                      title={isOpen ? "Collapse sub-sections" : "Expand sub-sections"}
                      aria-label={isOpen ? "Collapse sub-sections" : "Expand sub-sections"}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Sub-items list - Expand on CLICK only, no hover shifting */}
                {isExpanded && hasShortcuts && (
                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col ml-5 pl-3 border-l border-border/60 py-1 space-y-0.5">
                        {item.shortcuts?.map((shortcut, idx) => {
                          const isShortcutActiveState = isShortcutActive(
                            shortcut,
                            pathname,
                            searchParams
                          );
                          return (
                            <Link
                              key={idx}
                              href={shortcut.href}
                              target={shortcut.isExternal ? "_blank" : undefined}
                              rel={shortcut.isExternal ? "noopener noreferrer" : undefined}
                              onClick={recordSidebarInteraction}
                              className={`
                                py-1.5 px-2.5 rounded-lg text-xs transition-colors duration-150 truncate
                                ${
                                  isShortcutActiveState
                                    ? "text-primary font-semibold bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                }
                              `}
                            >
                              {shortcut.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Popover / Flyout for Collapsed Mode (Zero list shifting!) */}
                {isFlyoutOpen && (
                  <div
                    onMouseEnter={() => handleFlyoutEnter(item.id)}
                    onMouseLeave={handleFlyoutLeave}
                    className="absolute left-full top-0 ml-3 z-50 min-w-[210px] bg-card border border-border rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center gap-2 px-2.5 py-2 border-b border-border/60 mb-1">
                      <item.Icon className="w-4 h-4 text-primary shrink-0" />
                      <div className="font-semibold text-xs text-foreground truncate">
                        {item.text}
                      </div>
                    </div>

                    {hasShortcuts ? (
                      <div className="flex flex-col space-y-0.5">
                        {item.shortcuts?.map((shortcut, idx) => {
                          const active = isShortcutActive(shortcut, pathname, searchParams);
                          return (
                            <Link
                              key={idx}
                              href={shortcut.href}
                              target={shortcut.isExternal ? "_blank" : undefined}
                              rel={shortcut.isExternal ? "noopener noreferrer" : undefined}
                              onClick={() => {
                                recordSidebarInteraction();
                                setFlyoutItemId(null);
                              }}
                              className={`
                                py-1.5 px-2.5 rounded-lg text-xs transition-colors truncate
                                ${
                                  active
                                    ? "bg-primary text-primary-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }
                              `}
                            >
                              {shortcut.label}
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-2.5 py-1 text-[11px] text-muted-foreground">
                        {item.desc || item.text}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border shrink-0 text-center">
          {isExpanded ? (
            <p className="text-[10px] text-muted-foreground tracking-tight">
              PUNCH POS System
            </p>
          ) : (
            <span className="text-[9px] text-muted-foreground font-mono">v2</span>
          )}
        </div>
      </aside>
    </>
  );
});

Navigation.displayName = "Navigation";

export { Navigation };
