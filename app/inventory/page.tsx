"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Import the view type and new nav component
import InventoryNav, {
  InventoryView,
} from "./components/item-registration/utils/InventoryNav";

// Adjust component import paths to be relative
import ItemReg from "./components/item-registration/ItemReg";
import StockMgt from "./components/StockMgt";
import StocksMonitor from "./components/StocksMonitor";

export default function InventoryPage() {
  const [activeView, setActiveView] = useState<InventoryView>("register");

  // This function remains the same
  const renderView = () => {
    switch (activeView) {
      case "register":
        return <ItemReg />;
      case "manage":
        return <StockMgt />;
      case "monitor":
        return <StocksMonitor />;
      default:
        return <ItemReg />;
    }
  };

  return (
    <div className="p-6 text-white">
      {/* --- BACK BUTTON --- */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-4 text-slate-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* --- HEADER --- */}
      <h1 className="mb-4 font-bold text-2xl">Inventory Management</h1>
      <div className="mb-5 border border-slate-700"></div>

      {/* --- NEW NAVIGATION COMPONENT --- */}
      <InventoryNav activeView={activeView} setActiveView={setActiveView} />

      {/* --- DYNAMIC COMPONENT AREA --- */}
      <div className="mt-6">{renderView()}</div>
    </div>
  );
}
