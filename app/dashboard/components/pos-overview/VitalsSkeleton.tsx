"use client";

import React from "react";

export function VitalsSkeleton() {
  return (
    <div className="space-y-3 mb-5">
      {/* Vitals Header Skeleton */}
      <div className="flex items-center justify-between px-1 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="h-3 w-36 bg-muted rounded" />
        </div>
        <div className="h-3 w-28 bg-muted rounded hidden sm:block" />
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-full h-full bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between animate-pulse"
          >
            {/* Top Row: Label & Icon */}
            <div className="flex justify-between items-start mb-3">
              <div className="h-3.5 w-28 bg-muted rounded" />
              <div className="h-7 w-7 rounded-md bg-muted shrink-0" />
            </div>

            {/* Value Row */}
            <div className="mb-3">
              <div className="h-8 w-36 bg-muted rounded-md mb-1" />
            </div>

            {/* Sub-metrics Container */}
            <div className="mt-auto space-y-2 bg-muted/40 p-2.5 rounded-lg border border-border/60">
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-20 bg-muted/70 rounded" />
                <div className="h-2.5 w-16 bg-muted/70 rounded" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-16 bg-muted/60 rounded" />
                <div className="h-2.5 w-12 bg-muted/60 rounded" />
              </div>
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-18 bg-muted/60 rounded" />
                <div className="h-2.5 w-14 bg-muted/60 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
