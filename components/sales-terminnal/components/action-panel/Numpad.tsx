import React, { useState } from "react";
import { Delete, Keyboard, Calculator } from "lucide-react";

interface NumpadProps {
  onKeyPress: (key: string) => void;
  onClear: () => void;
  isTabletMode?: boolean; // [NEW]
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

const QWERTY_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
  ["Z", "X", "C", "V", "B", "N", "M", ".", "/"]
];

const SYMBOL_MAP: Record<string, string> = {
  "1": "!", "2": "@", "3": "#", "4": "$", "5": "%",
  "6": "^", "7": "&", "8": "*", "9": "(", "0": ")",
  ";": ":", ".": ","
};

export const Numpad = ({ onKeyPress, onClear, isTabletMode }: NumpadProps) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  // In tablet mode, default to showing the virtual QWERTY keyboard (showNumpadInTablet = false)
  const [showNumpadInTablet, setShowNumpadInTablet] = useState(false);
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = React.useRef(false);

  const handleKeyStart = (key: string) => {
    isLongPressActive.current = false;
    if (SYMBOL_MAP[key] && !isShift) {
      longPressTimer.current = setTimeout(() => {
        isLongPressActive.current = true;
        onKeyPress(SYMBOL_MAP[key]);
      }, 500);
    }
  };

  const handleKeyEnd = (key: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (isLongPressActive.current) return;

    // Handle character input
    let charToType = key;
    const isLetter = /^[a-zA-Z]$/.test(key);
    const isSpecial = SYMBOL_MAP[key] !== undefined;

    if (isSpecial && isShift) {
        charToType = SYMBOL_MAP[key] || key;
    } else if (isLetter) {
        const shouldUpper = isShift !== isCaps; // XOR logic
        charToType = shouldUpper ? key.toUpperCase() : key.toLowerCase();
    }

    onKeyPress(charToType);
    
    // Auto-reset shift
    if (isShift) setIsShift(false);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Toggle Header — different options for tablet vs desktop */}
      <div className="flex items-center justify-between shrink-0 h-6">
        <span className="text-xs text-muted-foreground font-bold">
          {isTabletMode
            ? (showNumpadInTablet ? "Numpad" : "Virtual Keyboard")
            : (showKeyboard ? "T9 Keypad" : "Numpad")
          }
        </span>
        <button
          type="button"
          onClick={() => isTabletMode ? setShowNumpadInTablet(!showNumpadInTablet) : setShowKeyboard(!showKeyboard)}
          onMouseDown={(e) => e.preventDefault()}
          className="p-1 rounded bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          title={isTabletMode
            ? (showNumpadInTablet ? "Show Virtual Keyboard" : "Show Numpad")
            : (showKeyboard ? "Show Numpad" : "Show T9 Keypad")
          }
        >
          {isTabletMode
            ? (showNumpadInTablet ? <Keyboard className="w-3 h-3" /> : <Calculator className="w-3 h-3" />)
            : (showKeyboard ? <Calculator className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />)
          }
        </button>
      </div>

      {isTabletMode && !showNumpadInTablet ? (
        <div className="flex flex-col gap-1.5 flex-1 justify-center max-w-full select-none">
          {QWERTY_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
              {/* Add CapsLock on Row 2 (A-L row) */}
              {rowIndex === 2 && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsCaps(!isCaps)}
                  className={`
                    w-12 sm:w-16 min-h-[38px] sm:min-h-[44px] rounded shadow-sm border font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center
                    ${isCaps ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}
                  `}
                >
                  CAPS
                </button>
              )}

              {/* Add Shift on Row 3 (Z-M row) */}
              {rowIndex === 3 && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsShift(!isShift)}
                  className={`
                    w-12 sm:w-16 min-h-[38px] sm:min-h-[44px] rounded shadow-sm border font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center
                    ${isShift ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"}
                  `}
                >
                  SHIFT
                </button>
              )}

              {row.map((key) => {
                const isRow0 = rowIndex === 0;
                const symbol = SYMBOL_MAP[key];
                const isLetter = /^[a-zA-Z]$/.test(key);
                
                // Determine what to display on the key
                let displayKey = key;
                if (isLetter) {
                    displayKey = (isShift !== isCaps) ? key.toUpperCase() : key.toLowerCase();
                } else if (isShift && symbol) {
                    displayKey = symbol;
                }

                return (
                  <button
                    type="button"
                    key={key}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleKeyStart(key);
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      handleKeyEnd(key);
                    }}
                    onMouseLeave={() => {
                        if (longPressTimer.current) {
                            clearTimeout(longPressTimer.current);
                        }
                    }}
                    onTouchStart={(e) => handleKeyStart(key)}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                        handleKeyEnd(key);
                    }}
                    className={`
                      relative flex-1 max-w-12 min-w-8 min-h-[38px] sm:min-h-[44px] 
                      bg-muted hover:bg-muted/80 text-foreground border-border 
                      font-bold text-sm sm:text-base rounded shadow-sm border 
                      active:scale-95 flex items-center justify-center transition-all
                    `}
                  >
                    <span className={symbol && !isShift ? "mt-1.5" : ""}>{displayKey}</span>
                    {symbol && !isShift && (
                      <span className="absolute top-0.5 right-1 text-[8px] sm:text-[10px] text-muted-foreground/60 font-normal leading-none">
                        {symbol}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {/* Action Row */}
          <div className="flex justify-center gap-1.5 mt-1 px-1">
            <button
              type="button"
              onClick={onClear}
              onMouseDown={(e) => e.preventDefault()}
              className="flex-[0.5] min-w-12 min-h-[38px] sm:min-h-[44px] bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs sm:text-sm rounded shadow-sm border border-red-500/30 active:scale-95 transition-all flex items-center justify-center"
            >
              Clear
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onKeyPress(" ");
              }}
              className="flex-2 min-h-[38px] sm:min-h-[44px] bg-muted hover:bg-muted/80 text-foreground border-border font-bold text-base sm:text-lg rounded shadow-sm border active:scale-95 transition-all flex items-center justify-center"
            >
              Space
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onKeyPress("Backspace");
              }}
              className="flex-[0.5] min-w-12 min-h-[38px] sm:min-h-[44px] bg-muted hover:bg-muted/80 text-foreground border-border font-bold text-base sm:text-xl rounded shadow-sm border active:scale-95 transition-all flex items-center justify-center"
            >
              ⌫
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onKeyPress("Enter");
              }}
              className="flex-1 min-w-16 min-h-[38px] sm:min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm sm:text-base rounded shadow-sm border border-primary/20 active:scale-95 transition-all flex items-center justify-center"
            >
              Enter
            </button>
          </div>
        </div>
      ) : isTabletMode && showNumpadInTablet ? (
        <div className="grid grid-cols-3 gap-2 flex-1">
          {KEYPAD_NUMBERS.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => key === "⌫" ? onClear() : onKeyPress(key)}
              onMouseDown={(e) => e.preventDefault()}
              className={`
                ${key === "⌫" ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30" : "bg-muted hover:bg-muted/80 text-foreground border-border"}
                font-bold text-lg sm:text-xl rounded-lg shadow-sm border active:scale-95 transition-all flex items-center justify-center min-h-[44px]
              `}
            >
              {key}
            </button>
          ))}
        </div>
      ) : showKeyboard ? (
        <div className="grid grid-cols-3 gap-2 flex-1">
          {T9_KEYS.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => item.key === "⌫" ? onClear() : onKeyPress(item.key)}
              onMouseDown={(e) => e.preventDefault()}
              className={`
                ${item.key === "⌫" ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30" : "bg-muted hover:bg-muted/80 text-foreground border-border"}
                font-bold text-lg sm:text-xl rounded-lg shadow-sm border active:scale-95 transition-all flex flex-col items-center justify-center min-h-[44px]
              `}
            >
              <span>{item.key}</span>
              {item.sub && <span className="text-[10px] text-muted-foreground/70 font-normal leading-none">{item.sub}</span>}
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
              onMouseDown={(e) => e.preventDefault()}
              className={`
                ${key === "⌫" ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30" : "bg-muted hover:bg-muted/80 text-foreground border-border"}
                font-bold text-lg sm:text-xl rounded-lg shadow-sm border active:scale-95 transition-all flex items-center justify-center min-h-[44px]
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
