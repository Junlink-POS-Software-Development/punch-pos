"use client";

import React, { useState, useEffect } from "react";
import { Store, Loader2, AlertTriangle, ArrowRight, LogOut } from "lucide-react";
import { getUserStores, switchActiveStore } from "@/app/actions/store";
import { logout } from "@/app/actions/auth";

interface StoreEntry {
  store_id: string;
  store_name: string;
  store_img: string | null;
  role: string;
}

export default function SelectStorePage() {
  const [stores, setStores] = useState<StoreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        const result = await getUserStores();
        if (result.success && result.stores) {
          setStores(result.stores);
          
          // If the user somehow only has one store, we should probably auto-select it
          // but for now, we'll let them pick or let the middleware handle it.
          if (result.stores.length === 1) {
             handleSelect(result.stores[0].store_id);
          }
        } else {
          setError(result.error || "Failed to load your stores.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStores();
  }, []);

  const handleSelect = async (storeId: string) => {
    if (isSwitching) return;
    setIsSwitching(true);
    setError(null);
    try {
      const result = await switchActiveStore(storeId);
      if (result.success) {
        window.location.href = "/";
      } else {
        setError(result.error || "Failed to enter store.");
        setIsSwitching(false);
      }
    } catch (err) {
      setError("An unexpected error occurred while switching.");
      setIsSwitching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading your stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground font-lexend">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary shadow-inner">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Select a Store</h1>
            <p className="text-muted-foreground">
              You have access to multiple stores. Please choose which one to manage for this session.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {stores.map((store) => (
              <button
                key={store.store_id}
                onClick={() => handleSelect(store.store_id)}
                disabled={isSwitching}
                className="group relative flex flex-col items-center p-6 bg-muted/30 hover:bg-muted border border-border/50 hover:border-primary/50 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                <div className="relative mb-4">
                  {store.store_img ? (
                    <img
                      src={store.store_img}
                      alt={store.store_name}
                      className="w-20 h-20 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-background border border-border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <Store className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider">
                    {store.role}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg truncate w-full px-2 mb-1 group-hover:text-primary transition-colors">
                  {store.store_name}
                </h3>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>Enter Store</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center border-t border-border/50 pt-8">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {isSwitching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
           <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
           <p className="text-xl font-bold tracking-tight">Initializing Session...</p>
        </div>
      )}
    </div>
  );
}
