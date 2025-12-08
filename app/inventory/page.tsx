"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import InventoryNav, { InventoryView } from "./components/InventoryNav";
import ItemReg from "./components/item-registration/ItemReg";
import { StockManagement } from "./components/stock-management/StockManagement";
import StocksMonitor from "./components/stocks-monitor/StocksMonitor";


function InventoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view") as InventoryView | null;

  const [activeView, setActiveView] = useState<InventoryView>("register");

  // Sync state with URL param
  useEffect(() => {
    if (viewParam && ["register", "manage", "monitor"].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, [viewParam]);

  const handleViewChange = (view: InventoryView) => {
    setActiveView(view);
    router.push(`/inventory?view=${view}`);
  };

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
        <InventoryNav activeView={activeView} setActiveView={handleViewChange} />
      </div>

      <div>{renderView()}</div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
        <InventoryContent />
    </Suspense>
  );
}
