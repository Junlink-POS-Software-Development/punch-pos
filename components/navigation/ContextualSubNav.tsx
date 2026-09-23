"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getNavItems, getActiveNavItem, isShortcutActive } from "./navConfig";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";
import { useBusinessMode } from "@/app/hooks/useBusinessMode";
import { ChevronRight } from "lucide-react";

export function ContextualSubNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isFullscreen, posMode, recordSidebarInteraction } = useViewStore();
  const { isRestaurant, modules } = useBusinessMode();
  const showKitchenKds = isRestaurant || modules.kitchen_display;
  const isTabletMode = posMode === "tablet";

  if (isFullscreen) return null;

  const navItems = getNavItems(showKitchenKds);
  const activeItem = getActiveNavItem(pathname, navItems);

  if (!activeItem || !activeItem.shortcuts || activeItem.shortcuts.length <= 1) {
    return null;
  }

  // Hide on desktop if not in tablet mode
  // If posMode === 'tablet', show on all screen sizes. Otherwise, only show on < lg.
  const containerVisibility = isTabletMode ? "flex" : "flex lg:hidden";

  return (
    <div
      onClick={recordSidebarInteraction}
      onTouchStart={recordSidebarInteraction}
      className={`fixed bottom-16 left-0 right-0 z-30 h-12 items-center border-t border-border/80 bg-background/95 backdrop-blur-md px-3 shadow-md ${containerVisibility}`}
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full py-1">
        {/* Section title badge */}
        <div className="flex items-center gap-1 shrink-0 text-muted-foreground font-semibold text-xs pl-1 pr-2 border-r border-border/60">
          <activeItem.Icon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate max-w-[80px] hidden sm:inline">{activeItem.text}</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/60 hidden sm:inline" />
        </div>

        {/* Shortcuts list pills */}
        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar py-0.5">
          {activeItem.shortcuts.map((shortcut, idx) => {
            const active = isShortcutActive(shortcut, pathname, searchParams);
            return (
              <Link
                key={idx}
                href={shortcut.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {shortcut.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
