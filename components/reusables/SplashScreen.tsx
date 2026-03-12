"use client";

import { useState, useEffect } from "react";

// ─── Splash Screen ──────────────────────────────────────────────────────────
// Shows the PUNCH branding on initial PWA load, then fades out  smoothly.
// Only renders once per session (uses sessionStorage to avoid repeat flashes).

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Skip splash if already shown this session
    if (sessionStorage.getItem("splash-shown")) {
      setIsVisible(false);
      return;
    }

    // Begin fade-out after a brief moment
    const fadeTimer = setTimeout(() => setIsFading(true), 1800);
    // Remove from DOM after fade animation completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("splash-shown", "1");
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-center
        bg-linear-to-b from-white via-slate-50 to-slate-100
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
        transition-opacity duration-700 ease-out
        ${isFading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      {/* Logo */}
      <div className="animate-[splash-logo_0.8s_ease-out_both]">
        <img
          src="/punch-logo.png"
          alt="PUNCH POS"
          className="w-28 h-28 object-contain drop-shadow-lg"
        />
      </div>

      {/* Text */}
      <div className="mt-6 text-center animate-[splash-text_0.8s_ease-out_0.3s_both]">
        <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
          PUNCH
        </h1>
        <p className="text-sm font-semibold tracking-[0.25em] text-slate-500 dark:text-slate-400 mt-1 uppercase">
          Point of Sale
        </p>
      </div>

      {/* Loading bar */}
      <div className="mt-10 w-40 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden animate-[splash-text_0.8s_ease-out_0.5s_both]">
        <div className="h-full bg-primary rounded-full animate-[splash-bar_2s_ease-in-out_both]" />
      </div>
    </div>
  );
}
