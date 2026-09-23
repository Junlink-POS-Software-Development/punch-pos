"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";
import { Loader2 } from "lucide-react";

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isNavigating, startNavigation, finishNavigation } = useViewStore();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global click listener to intercept internal link clicks instantly
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external, hash, new-tab, or modifier-click navigations
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if clicking current location exactly
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      startNavigation(href);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [startNavigation]);

  // Finish navigation when route or query params actually change
  useEffect(() => {
    if (isNavigating) {
      finishNavigation();
    }
  }, [pathname, searchParams, finishNavigation]);

  // Handle visual progress animation
  useEffect(() => {
    if (isNavigating) {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

      setVisible(true);
      setProgress(25);

      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      stepTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            if (stepTimerRef.current) clearInterval(stepTimerRef.current);
            return prev;
          }
          return prev + Math.random() * 12;
        });
      }, 150);

      // Safety timeout: auto-reset if navigation stalls or takes > 6s
      safetyTimeoutRef.current = setTimeout(() => {
        finishNavigation();
      }, 6000);
    } else if (visible) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

      // Finish cleanly to 100%
      setProgress(100);

      finishTimerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    }

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isNavigating, finishNavigation, visible]);

  if (!visible) return null;

  return (
    <>
      {/* 3px Top Progress Bar with gradient & drop-shadow */}
      <div className="fixed top-0 left-0 right-0 z-[10000] h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.9)] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating loading toast indicator */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/95 border border-primary/40 text-foreground shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 text-xs font-semibold select-none">
        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
        <span>Loading view...</span>
      </div>
    </>
  );
}
