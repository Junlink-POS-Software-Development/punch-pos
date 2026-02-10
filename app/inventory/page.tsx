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
    <div className="text-foreground">
      <div className="bg-card pt-2 pb-2 mx-4 rounded-2xl border border-border shadow-sm">
        <div className="px-6">
          <InventoryNav activeView={activeView} setActiveView={handleViewChange} />
        </div>
      </div>

      <div>{renderView()}</div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Loading...</div>}>
        <InventoryContent />
    </Suspense>
  );
}
