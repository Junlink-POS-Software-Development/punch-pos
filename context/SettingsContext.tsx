"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CurrencyCode } from "@/lib/utils/currency";

interface SettingsContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('pos-settings-currency');
    if (savedCurrency) {
      setCurrency(savedCurrency as CurrencyCode);
    }
    setMounted(true);
  }, []);

  const handleSetCurrency = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    localStorage.setItem('pos-settings-currency', newCurrency);
  };

  // Prevent hydration mismatch by rendering children only after mount, 
  // or you could render a loading state. For simple settings, 
  // rendering with default and updating is often acceptable, 
  // but to avoid flash of wrong currency, we might wait.
  // However, for a better UX, we'll just render.
  // Ideally, we should use a more robust persistence strategy or server-side prefs.
  // For now, we'll stick to client-side effect.

  return (
    <SettingsContext.Provider value={{ currency, setCurrency: handleSetCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
