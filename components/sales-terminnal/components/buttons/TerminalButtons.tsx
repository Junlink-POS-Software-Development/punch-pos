"use client";

import React from "react";
import {
  handleNewCustomer,
  handleAddToCart,
  handleDone,
  handleClear,
  handleMenu,
} from "./handlers";

type TerminalButtonsProps = {
  onSignInClick: () => void;
};

const TerminalButtons = React.memo(
  ({ onSignInClick }: TerminalButtonsProps) => {
    const terminalHandlers: Record<string, () => void> = {
      newCustomer: handleNewCustomer,
      addToCart: handleAddToCart,
      done: handleDone,
      clear: handleClear,
      signIn: onSignInClick,
      menu: handleMenu,
    };
    const buttons = [
      { id: "newCustomer", name: "New Customer" },
      { id: "addToCart", name: "Add to Cart" },
      { id: "done", name: "Done" },
      { id: "clear", name: "Clear" },
      { id: "signIn", name: "Sign In" },
      { id: "menu", name: "Menu" },
    ];
    return (
      <div className="gap-2 grid grid-cols-3 w-full h-full">
        {buttons.map((buttons) => (
          <React.Fragment key={buttons.id}>
            {" "}
            <div className="w-full">
              <button
                className="w-full h-[80%] text-nowrap btn-3d-glass"
                onClick={terminalHandlers[buttons.id]}
              >
                {buttons.name}
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
