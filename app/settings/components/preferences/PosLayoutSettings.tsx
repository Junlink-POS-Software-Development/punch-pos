"use client";

import React from "react";
import { Monitor, Tablet, Check, Sparkles, Maximize, Clock } from "lucide-react";
import { useViewStore, PosMode } from "@/components/window-layouts/store/useViewStore";

export function PosLayoutSettings() {
  const { 
    posMode, 
    setPosMode,
    autoFullscreenEnabled,
    setAutoFullscreenEnabled,
    autoFullscreenMinutes,
    setAutoFullscreenMinutes
  } = useViewStore();

  const options: {
    id: PosMode;
    title: string;
    description: string;
    icon: typeof Monitor;
    badge: string;
    features: string[];
  }[] = [
    {
      id: "desktop",
      title: "Desktop Mode (Classic 2-Column)",
      description: "Optimized for physical keyboards, rapid barcode scanning, and widescreen desktop monitors.",
      icon: Monitor,
      badge: "Fast Scanning",
      features: [
        "Split 2-column register & cart view",
        "Keyboard-first shortcuts guide",
        "Minimal screen footprint",
      ],
    },
    {
      id: "tablet",
      title: "Tablet Mode (Touch Action Panel)",
      description: "Optimized for touchscreens, POS tablets, and touch-screen cashier stations.",
      icon: Tablet,
      badge: "Touch Register",
      features: [
        "On-screen Touch QuickPick Grid",
        "Integrated Numpad & Virtual Keyboard",
        "Direct Touch Action Buttons (Disc, Voucher, Charge)",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            POS Terminal Display Mode
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Choose your cashier terminal layout format.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Active: {posMode === "tablet" ? "Tablet Touch" : "Desktop Standard"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = posMode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setPosMode(option.id)}
              className={`relative flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 group cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                  : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border"
              }`}
            >
              {/* Selected indicator */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary/50 shadow-sm"
                      : "bg-muted text-muted-foreground border-border/50 group-hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                    {option.badge}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3
                className={`font-bold text-sm mb-1 transition-colors ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {option.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {option.description}
              </p>

              {/* Features list */}
              <div className="mt-auto pt-3 border-t border-border/40 space-y-1.5">
                {option.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[11px] text-muted-foreground"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Auto-Fullscreen Settings Card */}
      <div className="p-5 rounded-2xl border border-border bg-card/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Maximize className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Auto-Fullscreen on Sidebar Inactivity
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically enter distraction-free fullscreen mode when working on the terminal without accessing the sidebar navigation.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoFullscreenEnabled}
              onChange={(e) => setAutoFullscreenEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {autoFullscreenEnabled && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Inactivity delay before entering fullscreen:
            </span>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 5].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setAutoFullscreenMinutes(mins)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    autoFullscreenMinutes === mins
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/50"
                  }`}
                >
                  {mins} {mins === 1 ? "min" : "mins"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
