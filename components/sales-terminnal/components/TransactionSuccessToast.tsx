"use client";

import React, { useEffect } from "react";
import { CheckCircle2, X, CloudOff } from "lucide-react";

export interface TransactionToastData {
  invoiceNo: string;
  total: number;
  customerName?: string | null;
  isOffline?: boolean;
}

interface TransactionSuccessToastProps {
  toast: TransactionToastData | null;
  onClose: () => void;
}

export const TransactionSuccessToast: React.FC<TransactionSuccessToastProps> = ({
  toast,
  onClose,
}) => {
  useEffect(() => {
    if (!toast) return;

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 z-50 pointer-events-auto max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 bg-card/95 backdrop-blur-md border border-emerald-500/40 shadow-xl shadow-black/10 text-card-foreground px-3.5 py-2.5 rounded-xl">
        {/* Animated Icon */}
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30">
          {toast.isOffline ? (
            <CloudOff className="h-4 w-4 text-amber-500" />
          ) : (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-25" />
              <CheckCircle2 className="h-4 w-4 relative z-10" />
            </>
          )}
        </div>

        {/* Text Info */}
        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">
              {toast.isOffline ? "Saved Offline" : "Transaction Saved"}
            </span>
            {toast.isOffline ? (
              <span className="text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                Queued
              </span>
            ) : (
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono truncate">
            <span>{toast.invoiceNo}</span>
            <span>•</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-sans">
              ₱{toast.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
