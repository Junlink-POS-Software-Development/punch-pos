"use client";

import React from "react";
import { Store, ChevronDown, Check, Loader2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { useStoreSwitcher } from "@/app/settings/hooks/useStoreSwitcher";

export function StoreSwitcher() {
  const {
    stores,
    currentStore,
    otherStores,
    isLoading,
    isOpen,
    setIsOpen,
    isSwitching,
    error,
    handleSwitch,
  } = useStoreSwitcher();

  // Don't render if loading or only 1 store (no switching needed)
  if (isLoading) {
    return (
      <div className="p-4 bg-card border border-border rounded-xl animate-pulse">
        <div className="h-5 w-48 bg-muted rounded" />
      </div>
    );
  }

  if (stores.length <= 1) return null;

  return (
    <div className="relative">
      {/* Switching overlay */}
      {isSwitching && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-xl">
          <div className="flex items-center gap-3 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium text-sm">Switching store…</span>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300">
        {/* Header */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Switch Store</p>
              <p className="text-xs text-muted-foreground">
                {currentStore
                  ? `Currently on: ${currentStore.store_name}`
                  : "Select a store"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {stores.length} stores
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mb-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropdown list */}
        {isOpen && (
          <div className="border-t border-border animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Current store */}
            {currentStore && (
              <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-l-2 border-primary">
                {currentStore.store_img ? (
                  <img
                    src={currentStore.store_img}
                    alt={currentStore.store_name}
                    className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentStore.store_name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {currentStore.role}
                  </p>
                </div>
                <Check className="w-4 h-4 text-primary shrink-0" />
              </div>
            )}

            {/* Other stores */}
            {otherStores.map((store) => (
              <button
                key={store.store_id}
                type="button"
                onClick={() => handleSwitch(store.store_id)}
                disabled={isSwitching}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                {store.store_img ? (
                  <img
                    src={store.store_img}
                    alt={store.store_name}
                    className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">
                    {store.store_name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {store.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
