import React, { useState } from "react";
import { Delete, Keyboard, Calculator } from "lucide-react";

interface NumpadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
}

const KEYPAD_NUMBERS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫"];
const T9_KEYS = [
  { key: "1", sub: "" },
  { key: "2", sub: "ABC" },
  { key: "3", sub: "DEF" },
  { key: "4", sub: "GHI" },
  { key: "5", sub: "JKL" },
  { key: "6", sub: "MNO" },
  { key: "7", sub: "PQRS" },
  { key: "8", sub: "TUV" },
  { key: "9", sub: "WXYZ" },
  { key: ".", sub: "" },
  { key: "0", sub: "_" },
  { key: "⌫", sub: "" }
];

export const Numpad = ({ onKeyPress, onClear }: NumpadProps) => {
  const [showKeyboard, setShowKeyboard] = useState(false);

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between shrink-0 h-6">
        <span className="text-xs text-slate-400 font-bold">
          {showKeyboard ? "T9 Keypad" : "Numpad"}
        </span>
        <button
          type="button"
          onClick={() => setShowKeyboard(!showKeyboard)}
          className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title={showKeyboard ? "Show Numpad" : "Show T9 Keypad"}
        >
          {showKeyboard ? <Calculator className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />}
        </button>
      </div>

      {showKeyboard ? (
        <div className="grid grid-cols-3 gap-2 flex-1">
          {T9_KEYS.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => item.key === "⌫" ? onClear() : onKeyPress(item.key)}
              className={`
                ${item.key === "⌫" ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30" : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"}
                font-bold text-lg sm:text-xl rounded-lg shadow-md border active:bg-slate-600 transition-colors flex flex-col items-center justify-center min-h-[44px]
              `}
            >
              <span>{item.key}</span>
              {item.sub && <span className="text-[10px] text-slate-500 font-normal leading-none">{item.sub}</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 flex-1">
          {KEYPAD_NUMBERS.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => key === "⌫" ? onClear() : onKeyPress(key)}
              className={`
                ${key === "⌫" ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30" : "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"}
                font-bold text-lg sm:text-xl rounded-lg shadow-md border active:bg-slate-600 transition-colors flex items-center justify-center min-h-[44px]
              `}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
