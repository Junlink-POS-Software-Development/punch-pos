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
      <label className="block mb-2 font-medium text-slate-400 text-sm">
        Display Currency
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 px-4 py-3 rounded-xl w-full sm:w-72 text-left transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center bg-cyan-500/10 rounded-lg w-8 h-8 text-cyan-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-slate-200">{selectedCurrency.label}</p>
            <p className="text-slate-500 text-xs">{selectedCurrency.code} ({selectedCurrency.symbol})</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="z-50 absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 shadow-xl rounded-xl w-full sm:w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  currency === c.code ? 'bg-cyan-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${currency === c.code ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {c.label}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {c.code} ({c.symbol})
                  </span>
                </div>
                {currency === c.code && (
                  <Check className="w-4 h-4 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
