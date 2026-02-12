"use client";

import { Keyboard, X, Command } from "lucide-react";
import { useState, useEffect } from "react";

interface ShortcutsGuideProps {
  isInline?: boolean;
}

export const ShortcutsGuide = ({ isInline = false }: ShortcutsGuideProps) => {
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
    { key: "Spacebar", label: "Open Payment / Finish", alt: "Enter to confirm in popup" },
    { key: "Alt + F1", label: "Search Customer" },
    { key: "Alt + F3", label: "Free Item Modal" },
    { key: "Enter on Qty", label: "Add to Checkout" },
  ];

  if (isInline) {
    const allShortcuts = [...terminalShortcuts, ...navigationShortcuts];
    
    return (
      <div className="bg-card/30 rounded-xl border border-border p-3 flex flex-col max-h-[200%] animate-in fade-in duration-500 overflow-hidden">
        <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-1.5 shrink-0">
            <Command className="w-3.5 h-3.5 text-primary" />
            <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Shortcuts
            </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-1.5 pb-1">
            {allShortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-muted/20 px-2 py-1.5 border border-border/40 rounded-lg hover:bg-muted/40 transition-colors group"
              >
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate mr-1.5">
                  {shortcut.label}
                </span>
                <kbd className="bg-background px-1 py-0.5 border border-border/60 rounded font-mono text-[9px] text-primary shrink-0 shadow-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
        
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(var(--primary), 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(var(--primary), 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex justify-center items-center bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/50 rounded-lg w-10 h-10 transition-all duration-300"
        title="View Keyboard Shortcuts"
      >
        <Keyboard className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="z-60 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in duration-200 fade-in">
          <div className="relative bg-card shadow-2xl border border-border rounded-2xl w-full max-w-2xl max-h-[90%] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-muted/30 px-6 py-4 border-border border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Command className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg tracking-wide">
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Navigate the system quickly without using a mouse.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hover:bg-destructive/10 p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-card">
              {/* Terminal Actions */}
              <div>
                <h4 className="mb-3 font-semibold text-primary text-sm uppercase tracking-wider">
                  Terminal Actions
                </h4>
                <div className="gap-3 grid grid-cols-1">
                  {terminalShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-muted/20 p-3 border border-border rounded-xl hover:bg-muted/40 transition-colors"
                    >
                      <div>
                        <span className="font-medium text-foreground text-sm">
                          {shortcut.label}
                        </span>
                        {shortcut.alt && (
                          <p className="text-muted-foreground text-xs mt-0.5">
                            or {shortcut.alt}
                          </p>
                        )}
                      </div>
                      <kbd className="bg-background shadow-sm px-3 py-1 border border-border rounded font-mono font-medium text-[11px] text-primary">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                  Navigation
                </h4>
                <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
                  {navigationShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-muted/10 p-3 border border-border hover:border-primary/30 rounded-xl transition-colors"
                    >
                      <span className="font-medium text-foreground/80 text-sm">
                        {shortcut.label}
                      </span>
                      <kbd className="bg-background shadow-sm px-2 border border-border rounded h-7 font-mono font-medium text-[10px] text-muted-foreground flex items-center">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-muted/20 px-6 py-3 border-border border-t text-center shrink-0">
              <p className="text-muted-foreground text-xs">
                Press <span className="font-bold text-primary">Esc</span> to
                close this window
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
