import React from "react";

interface QuickPickItem {
  label: string;
  color: string;
}

interface QuickPickGridProps {
  items: QuickPickItem[];
  onSelect: (item: QuickPickItem) => void;
}

export const QuickPickGrid = ({ items, onSelect }: QuickPickGridProps) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
      <div className="grid grid-cols-3 gap-2">
        {items.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(btn)}
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
    </div>
  );
};
