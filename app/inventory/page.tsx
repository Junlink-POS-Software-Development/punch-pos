"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import InventoryNav, { InventoryView } from "./components/InventoryNav";
import ItemReg from "./components/item-registration/ItemReg";
import { StockManagement } from "./components/stock-management/StockManagement";
import StocksMonitor from "./components/StocksMonitor";

export default function InventoryPage() {
  const [activeView, setActiveView] = useState<InventoryView>("register");

  const renderView = () => {
    switch (activeView) {
      case "register":
        return <ItemReg />;
      case "manage":
        return <StockManagement />;
      case "monitor":
        return <StocksMonitor />;
      default:
        return <ItemReg />;
    }
  };

  return (
    <div className="text-white">
      <div className="bg-primary-light">
        {/* --- BACK BUTTON --- */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-2 pt-2 pl-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* --- HEADER & NAVIGATION --- */}
        <div className="flex justify-between items-end">
          <h1 className="pl-4 font-bold text-3xl">Inventory Management</h1>
          {/* Placeholder for future global actions, currently empty */}
        </div>
      </div>

      <div className="top-0 z-10 sticky bg-primary-light backdrop-blur-2xl">
        <InventoryNav activeView={activeView} setActiveView={setActiveView} />
      </div>

      <div>{renderView()}</div>
    </div>
  );
}
