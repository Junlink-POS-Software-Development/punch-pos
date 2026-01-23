"use client";

import React from "react";
import { Delete, Eraser } from "lucide-react";

// Placeholder data for buttons
const ACTION_BUTTONS = [
  { label: "LARGE COFFEE", color: "bg-amber-700/50 text-amber-100 border-amber-600/50" },
  { label: "PLASTIC BAG", color: "bg-yellow-700/50 text-yellow-100 border-yellow-600/50" },
  { label: "SERVICES", color: "bg-cyan-700/50 text-cyan-100 border-cyan-600/50" },
  { label: "PROMO ITEMS", color: "bg-emerald-700/50 text-emerald-100 border-emerald-600/50" },
  { label: "PROMO ITEMS", color: "bg-yellow-700/50 text-yellow-100 border-yellow-600/50" },
  { label: "PROMO ITEMS", color: "bg-rose-700/50 text-rose-100 border-rose-600/50" },
  { label: "PHIE COFFEE PRICES", color: "bg-orange-700/50 text-orange-100 border-orange-600/50" },
  { label: "PIRK COFFEE DEXCING", color: "bg-purple-700/50 text-purple-100 border-purple-600/50" },
  { label: "DISCOUNT", color: "bg-red-700/50 text-red-100 border-red-600/50" },
  { label: "DAILY PROMO ITEMS", color: "bg-red-700/50 text-red-100 border-red-600/50" },
  { label: "DAILY COFFEE BAG", color: "bg-sky-700/50 text-sky-100 border-sky-600/50" },
  { label: "+ADD MODIFIER", color: "bg-slate-700/50 text-slate-100 border-slate-600/50" },
];

const KEYPAD_NUMBERS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "+/-"];

export default function ActionPanel() {
  return (
    <div className="flex flex-col h-full bg-[#0F172A] border-l border-slate-800 p-4 gap-4 w-[450px] shrink-0">
      <h2 className="text-white font-lexend font-medium text-lg">Action Panel</h2>

      {/* Main Grid Area */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Action Buttons Grid */}
        <div className="grid grid-cols-3 gap-2 content-start w-3/5">
          {ACTION_BUTTONS.map((btn, idx) => (
            <button
              key={idx}
              className={`
                ${btn.color} border shadow-lg backdrop-blur-sm
                rounded-lg p-1 text-[10px] font-bold leading-tight h-16
                hover:brightness-110 active:scale-95 transition-all
                flex items-center justify-center text-center break-words
              `}
            >
              [{btn.label}]
            </button>
          ))}
        </div>

        {/* Right: Keypad */}
        <div className="flex flex-col gap-2 w-2/5">
          {/* Display Area */}
          <div className="bg-slate-800/80 rounded-lg p-2 flex items-center justify-between border border-slate-700 mb-2">
             <span className="text-slate-400 text-xs">QTY</span>
             <Delete className="w-4 h-4 text-slate-500 cursor-pointer hover:text-red-400" />
          </div>

          <div className="grid grid-cols-3 gap-2 flex-1">
            {KEYPAD_NUMBERS.map((key) => (
              <button
                key={key}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl rounded-lg shadow-md border border-slate-700 active:bg-slate-600 transition-colors flex items-center justify-center"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charge Button */}
      <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-2xl py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98]">
        [ CHARGE ₱0.00 ]
      </button>

      {/* Bottom Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button className="bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors text-sm">
          [ PARK SALE ]
        </button>
        <button className="bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors text-sm">
          [ DISCOUNT ]
        </button>
        <button className="bg-slate-800 border border-slate-700 text-slate-300 font-bold py-3 rounded-lg hover:bg-slate-700 transition-colors text-sm">
          [ OPEN DRAWER ]
        </button>
      </div>

      {/* Footer: Barcode & Intelligence */}
      <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-800/50">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-bold">Barcode</label>
          <div className="relative">
             <input 
               type="text" 
               className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
               autoFocus
             />
             <span className="absolute left-3 top-2.5 w-0.5 h-4 bg-cyan-400 animate-pulse"></span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
           <label className="text-xs text-slate-400 font-bold">Customer Intelligence</label>
           <div className="bg-slate-900/50 rounded-lg p-2 text-[10px] text-slate-300 border border-slate-800">
              <p>Loyalty: 150 pts</p>
              <p className="truncate">Last Purchase: Stardew Valley Plushie</p>
              <p className="text-slate-500">(2 days ago)</p>
           </div>
        </div>
      </div>
    </div>
  );
}
