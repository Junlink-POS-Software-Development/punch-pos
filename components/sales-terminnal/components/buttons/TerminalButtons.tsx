// app/inventory/components/stock-management/components/buttons/TerminalButtons.tsx
"use client";

import React from "react";
import { handleNewCustomer, handleMenu } from "./handlers"; // Keep static handlers here

type TerminalButtonsProps = {
  isLoggedIn: boolean;
  onSignInClick: () => void;
  onLogoutClick: () => void;
  onAddToCartClick: () => void;
  onDoneClick: () => void;
  onClearClick: () => void; // <--- ADD THIS
};

const TerminalButtons = React.memo(
  ({
    isLoggedIn,
    onSignInClick,
    onLogoutClick,
    onAddToCartClick,
    onDoneClick,
    onClearClick, // <--- DESTRUCTURE
  }: TerminalButtonsProps) => {
    // Map the button IDs to the props passed from SalesTerminal
    const terminalHandlers: Record<string, () => void> = {
      newCustomer: handleNewCustomer,
      addToCart: onAddToCartClick,
      done: onDoneClick,
      clear: onClearClick, // <--- Use the prop, not the static import
      signIn: isLoggedIn ? onLogoutClick : onSignInClick,
      menu: handleMenu,
    };

    const buttons = [
      { id: "newCustomer", name: "New Customer" },
      { id: "addToCart", name: "Add to Cart" },
      { id: "done", name: "Done" },
      { id: "clear", name: "Clear" },
      { id: "signIn", name: isLoggedIn ? "Logout" : "Sign In" },
      { id: "menu", name: "Menu" },
    ];

    return (
      <div className="gap-2 grid grid-cols-3 w-full h-full">
        {buttons.map((button) => (
          <React.Fragment key={button.id}>
            <div className="w-full">
              <button
                className="w-full h-[80%] text-nowrap btn-3d-glass"
                onClick={terminalHandlers[button.id]}
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
