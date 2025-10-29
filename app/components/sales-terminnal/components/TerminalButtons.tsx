"use client";

import React from "react";

const TerminalButtons = () => {
  const buttons = [
    { id: "newCostumer", name: "New Costumer" },
    { id: "addToCart", name: "Add to Cart" },
    { id: "done", name: "Done" },
    { id: "clear", name: "Clear" },
    { id: "signout", name: "Signout" },
    { id: "menu", name: "Menu" },
  ];
  return (
    <div className="gap-2 grid grid-cols-3 border border-amber-100 w-full h-full">
      {buttons.map((buttons) => (
        <React.Fragment key={buttons.id}>
          {" "}
          <div className="w-full">
            <button className="w-full h-[70%] btn-3d-glass">
              {buttons.name}
            </button>
          </div>
        </React.Fragment>
      ))}{" "}
    </div>
  );
};

export default TerminalButtons;
