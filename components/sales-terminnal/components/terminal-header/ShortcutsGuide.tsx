"use client";

import { Keyboard, X, Command } from "lucide-react";
import { useState, useEffect } from "react";

export const ShortcutsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key if open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const navigationShortcuts = [
    { key: "Esc", label: "Clear Terminal / Cancel" },
    { key: "Alt + H", label: "Home / POS" },
    { key: "Alt + D", label: "Dashboard" },
    { key: "Alt + T", label: "Transactions History" },
    { key: "Alt + I", label: "Inventory Management" },
    { key: "Alt + C", label: "Customer Database" },
    { key: "Alt + E", label: "Expenses" },
    { key: "Alt + R", label: "Reports" },
    { key: "Alt + S", label: "Settings" },
  ];

  const terminalShortcuts = [
    { key: "Spacebar", label: "Open Payment / Finish", alt: "Alt + Enter to submit directly" },
    { key: "Alt + F1", label: "Search Customer" },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex justify-center items-center bg-slate-800/50 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/50 rounded-lg w-10 h-10 transition-all duration-300"
        title="View Keyboard Shortcuts"
      >
        <Keyboard className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="z-60 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in duration-200 fade-in">
          <div className="relative bg-slate-900/90 shadow-2xl border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90%] overflow-hidden glass-effect flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-slate-800/30 px-6 py-4 border-slate-700/50 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 p-2 rounded-lg">
                  <Command className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-(family-name:--font-lexend) font-bold text-white text-lg tracking-wide">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Navigate the system quickly without using a mouse.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-red-500/10 p-2 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Terminal Actions */}
              <div>
                <h4 className="mb-3 font-semibold text-cyan-400 text-sm uppercase tracking-wider">
                  Terminal Actions
                </h4>
                <div className="gap-3 grid grid-cols-1">
                  {terminalShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-cyan-950/30 p-3 border border-cyan-800/30 rounded-xl"
                    >
                      <div>
                        <span className="font-medium text-slate-200 text-sm">
                          {shortcut.label}
                        </span>
                        {shortcut.alt && (
                          <p className="text-slate-500 text-xs mt-0.5">
                            or {shortcut.alt}
                          </p>
                        )}
                      </div>
                      <kbd className="bg-slate-800 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)] px-3 py-1 border border-slate-700 rounded font-mono font-medium text-[11px] text-cyan-300">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="mb-3 font-semibold text-slate-400 text-sm uppercase tracking-wider">
                  Navigation
                </h4>
                <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                  {navigationShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-slate-950/40 p-3 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
                    >
                      <span className="font-medium text-slate-300 text-sm">
                        {shortcut.label}
                      </span>
                      <kbd className="bg-slate-800 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)] px-2 border border-slate-700 rounded h-7 font-mono font-medium text-[10px] text-slate-300 flex items-center">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950/30 px-6 py-3 border-slate-800 border-t text-center shrink-0">
              <p className="text-slate-500 text-xs">
                Press <span className="font-bold text-cyan-400">Esc</span> to
                close this window
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
