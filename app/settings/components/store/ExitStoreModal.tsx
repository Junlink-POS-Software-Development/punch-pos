"use client";

import React, { useState } from "react";
import { Loader2, X, AlertTriangle, LogOut } from "lucide-react";

interface ExitStoreModalProps {
  onClose: () => void;
}

export function ExitStoreModal({ onClose }: ExitStoreModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExitStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your password to confirm.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { leaveStore } = await import("@/app/actions/store");
      const result = await leaveStore(password);
      
      if (result.success) {
        // Will be redirected
        window.location.href = "/";
      } else {
        setError(result.error || "Failed to exit store. Please check your password.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-destructive/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-destructive">Exit Store</h2>
              <p className="text-xs text-muted-foreground">
                You are about to leave this store.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <div className="mb-6 text-sm text-foreground space-y-2">
            <p>
              Are you sure you want to exit this store?
            </p>
            <p className="text-muted-foreground">
              You will lose access to the store's data immediately. To rejoin, you will need a new invitation or enrollment ID. Please enter your password to confirm.
            </p>
          </div>

          <form onSubmit={handleExitStore} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground ml-1">Confirm Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive transition-all placeholder:text-muted-foreground/30"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full flex items-center justify-center gap-2 py-3 bg-destructive text-destructive-foreground font-bold rounded-xl hover:bg-destructive/90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exiting...
                </>
              ) : (
                "Confirm & Exit Store"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
