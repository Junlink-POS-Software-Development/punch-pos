"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { CURRENCIES, CurrencyCode } from "@/lib/utils/currency";
import { Check, ChevronDown, Coins } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function CurrencySelector() {
  const { currency, setCurrency } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
        Display Currency
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center bg-muted/20 hover:bg-muted/40 border border-border/50 hover:border-primary/50 px-4 py-3 rounded-xl w-full sm:w-72 text-left transition-all group mt-2 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center bg-primary/10 rounded-lg w-8 h-8 text-primary border border-primary/20">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-foreground tracking-tight">{selectedCurrency.label}</p>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-tighter">{selectedCurrency.code} ({selectedCurrency.symbol})</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="z-50 absolute top-full left-0 mt-2 bg-card border border-border shadow-2xl rounded-xl w-full sm:w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors ${
                  currency === c.code ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold tracking-tight ${currency === c.code ? 'text-primary' : 'text-foreground'}`}>
                    {c.label}
                  </span>
                  <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-tighter">
                    {c.code} ({c.symbol})
                  </span>
                </div>
                {currency === c.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
