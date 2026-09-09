"use client";

import React from "react";

interface AlertListSkeletonProps {
  rows?: number;
}

export function AlertListSkeleton({ rows = 4 }: AlertListSkeletonProps) {
  return (
    <div className="space-y-2 py-1">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex justify-between items-center p-2 rounded bg-muted/20 border border-border/40 animate-pulse"
        >
          <div className="flex flex-col gap-1.5 flex-1 pr-2">
            <div
              className="h-3.5 bg-muted rounded"
              style={{ width: `${60 + (idx % 3) * 15}%` }}
            />
            <div
              className="h-2.5 bg-muted/60 rounded"
              style={{ width: `${35 + (idx % 2) * 20}%` }}
            />
          </div>
          <div className="h-5 w-14 bg-muted/70 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}
