"use client";

import React from "react";
import {
  handleNewCustomer,
  handleAddToCart,
  handleDone,
  handleClear,
  handleSignIn,
  handleMenu,
} from "./handlers";

const terminalHandlers: Record<string, () => void> = {
  newCustomer: handleNewCustomer,
  addToCart: handleAddToCart,
  done: handleDone,
  clear: handleClear,
  signout: handleSignIn,
  menu: handleMenu,
};

const TerminalButtons = React.memo(() => {
  const buttons = [
    { id: "newCustomer", name: "New Customer" },
    { id: "addToCart", name: "Add to Cart" },
    { id: "done", name: "Done" },
    { id: "clear", name: "Clear" },
    { id: "signout", name: "Signout" },
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
});

TerminalButtons.displayName = "TerminalButtons";

export default TerminalButtons;
