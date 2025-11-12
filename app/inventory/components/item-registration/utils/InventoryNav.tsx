"use client";

import React from "react";
import { PackagePlus, Boxes, Monitor } from "lucide-react";

// Define and export the view type
export type InventoryView = "register" | "manage" | "monitor";

// Define the props interface
interface InventoryNavProps {
  activeView: InventoryView;
  setActiveView: (view: InventoryView) => void;
}

const InventoryNav: React.FC<InventoryNavProps> = ({
  activeView,
  setActiveView,
}) => {
  const navItems = [
    { id: "register", text: "Register Item", Icon: PackagePlus },
    { id: "manage", text: "Manage Stocks", Icon: Boxes },
    { id: "monitor", text: "Stocks Monitor", Icon: Monitor },
  ];

  return (
    // Use a 3-column grid for the navigation
    <nav className="gap-4 grid grid-cols-1 md:grid-cols-3 mb-8">
      {navItems.map((item) => (
        <button
          key={item.id}
          // Use btn-3d-glass and add flex for icon alignment
          className={`btn-3d-glass flex items-center justify-center gap-2 ${
            activeView === item.id
              ? "bg-white/20" // Active state
              : ""
          }`}
          onClick={() => setActiveView(item.id as InventoryView)}
        >
          <item.Icon className="w-5 h-5" />
          <span>{item.text}</span>
        </button>
      ))}
    </nav>
  );
};

export default InventoryNav;
