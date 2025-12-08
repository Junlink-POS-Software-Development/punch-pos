// app/inventory/components/stock-management/components/buttons/TerminalButtons.tsx
"use client";
import React from "react";
type TerminalButtonsProps = {
  onAddToCartClick: () => void; // Back to sync
  onDoneClick: () => void;
  onClearClick: () => void;
};
const TerminalButtons = React.memo(
  ({ onAddToCartClick, onDoneClick, onClearClick }: TerminalButtonsProps) => {
    const terminalHandlers: Record<string, () => void> = {
      addToCart: onAddToCartClick,
      done: onDoneClick,
      clear: onClearClick,
    };
    // Removed: newCustomer, signIn, menu
    const buttons = [
      { id: "addToCart", name: "Add to Cart" },
      { id: "done", name: "Done" },
      { id: "clear", name: "Clear" },
    ];
    return (
      <div className="gap-2 grid grid-cols-3 w-full h-24 shrink-0">
        {buttons.map((button) => (
          <React.Fragment key={button.id}>
            <div className="w-full">
              <button
                type="button"
                className="w-full h-[80%] text-nowrap btn-3d-glass"
                onClick={() => {
                  console.log(`[TerminalButtons] Clicked: ${button.id}`);
                  terminalHandlers[button.id]();
                }}
              >
                {button.name}
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }
);
TerminalButtons.displayName = "TerminalButtons";
export default TerminalButtons;
