"use client";

import React from "react";
import { User, Store, Sparkles } from "lucide-react";

interface WelcomeModalProps {
  userName: string;
  storeName: string;
  storeLogo: string | null;
  onClose: () => void;
}

export function WelcomeModal({
  userName,
  storeName,
  storeLogo,
  onClose,
}: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in-95 fade-in duration-500">
        {/* Decorative sparkles */}
        <div className="absolute -top-3 -right-3 text-yellow-400 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute -bottom-2 -left-2 text-primary/40 animate-pulse delay-500">
          <Sparkles className="w-6 h-6" />
        </div>

        {/* Store Logo */}
        <div className="mx-auto mb-6 w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-lg">
          {storeLogo ? (
            <img
              src={storeLogo}
              alt={storeName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Store className="w-10 h-10 text-primary/50" />
          )}
        </div>

        {/* Welcome text */}
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Welcome aboard! 🎉
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Everything is set up and ready to go.
        </p>

        {/* Info cards */}
        <div className="space-y-3 mb-8">
          <div className="bg-muted/30 border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Your Name
              </p>
              <p className="text-sm font-semibold text-foreground">
                {userName}
              </p>
            </div>
          </div>

          <div className="bg-muted/30 border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Store
              </p>
              <p className="text-sm font-semibold text-foreground">
                {storeName || "Your Store"}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
        >
          <Sparkles className="w-4 h-4" />
          Get Started
        </button>
      </div>
    </div>
  );
}
