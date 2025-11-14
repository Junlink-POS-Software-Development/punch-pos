// InventoryNav.tsx

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
    // 1. Use flex layout instead of grid to keep tabs grouped
    <nav className="flex items-center gap-6 pb-1 border-slate-700 border-b w-full overflow-x-auto">
      {navItems.map((item) => (
        <button
          key={item.id}
          // 2. Remove bulky 'btn-3d-glass' and use padding/border for tabs
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap 
            transition-colors duration-200 ease-in-out
            
            ${
              activeView === item.id
                ? "text-blue-400 border-b-2 border-blue-400" // Active state: Blue underline
                : "text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-slate-500" // Inactive state: Subtle hover
            }
          `}
          onClick={() => setActiveView(item.id as InventoryView)}
        >
          <item.Icon className="w-4 h-4" />
          <span>{item.text}</span>
        </button>
      ))}
    </nav>
  );
};

export default InventoryNav;
