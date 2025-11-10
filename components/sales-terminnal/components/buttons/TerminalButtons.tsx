// TerminalButtons.tsx
// (Revised to be dynamic based on auth state)

"use client";

import React from "react";
import {
  handleNewCustomer,
  handleAddToCart,
  handleDone,
  handleClear,
  handleMenu,
  // handleLogOut is no longer imported here; the handler is passed via props
} from "./handlers";

// 1. Update prop types
type TerminalButtonsProps = {
  isLoggedIn: boolean;
  onSignInClick: () => void;
  onLogoutClick: () => void;
};

const TerminalButtons = React.memo(
  // 2. Destructure new props
  ({ isLoggedIn, onSignInClick, onLogoutClick }: TerminalButtonsProps) => {
    const terminalHandlers: Record<string, () => void> = {
      newCustomer: handleNewCustomer,
      addToCart: handleAddToCart,
      done: handleDone,
      clear: handleClear,
      // 3. Dynamically assign the correct handler
      signIn: isLoggedIn ? onLogoutClick : onSignInClick,
      menu: handleMenu,
    };

    const buttons = [
      { id: "newCustomer", name: "New Customer" },
      { id: "addToCart", name: "Add to Cart" },
      { id: "done", name: "Done" },
      { id: "clear", name: "Clear" },
      // 4. Dynamically set the button text
      { id: "signIn", name: isLoggedIn ? "Logout" : "Sign In" },
      { id: "menu", name: "Menu" },
    ];

    return (
      <div className="gap-2 grid grid-cols-3 w-full h-full">
        {buttons.map(
          (
            button // Fixed map variable from 'buttons' to 'button'
          ) => (
            <React.Fragment key={button.id}>
              {" "}
              <div className="w-full">
                <button
                  className="w-full h-[80%] text-nowrap btn-3d-glass"
                  onClick={terminalHandlers[button.id]}
                >
                  {button.name}
                </button>
              </div>
            </React.Fragment>
          )
        )}{" "}
      </div>
    );
  }
);

TerminalButtons.displayName = "TerminalButtons";

export default TerminalButtons;
