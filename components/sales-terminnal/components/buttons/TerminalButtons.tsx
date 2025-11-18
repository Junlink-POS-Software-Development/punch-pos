"use client";

import React from "react";
import {
  handleNewCustomer,
  // handleAddToCart, // <-- REMOVE this import
  handleDone,
  handleClear,
  handleMenu,
} from "./handlers";

// 1. Update prop types
type TerminalButtonsProps = {
  isLoggedIn: boolean;
  onSignInClick: () => void;
  onLogoutClick: () => void;
  onAddToCartClick: () => void; // <-- ADD this prop
};

const TerminalButtons = React.memo(
  // 2. Destructure new prop
  ({
    isLoggedIn,
    onSignInClick,
    onLogoutClick,
    onAddToCartClick, // <-- ADD this prop
  }: TerminalButtonsProps) => {
    const terminalHandlers: Record<string, () => void> = {
      newCustomer: handleNewCustomer,
      addToCart: onAddToCartClick, // <-- ASSIGN the prop here
      done: handleDone,
      clear: handleClear,
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
        ))}{" "}
      </div>
    );
  }
);

TerminalButtons.displayName = "TerminalButtons";

export default TerminalButtons;
