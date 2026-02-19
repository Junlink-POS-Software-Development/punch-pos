"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ItemReg from "./components/item-registration/ItemReg";
import { StockManagement } from "./components/stock-management/StockManagement";
import StocksMonitor from "./components/stocks-monitor/StocksMonitor";


function InventoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewParam = searchParams.get("view") as any; // Cast for simplicity or use specific type

  const [activeView, setActiveView] = useState("register");

  // Sync state with URL param
  useEffect(() => {
    if (viewParam && ["register", "manage", "monitor"].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, [viewParam]);

  const handleViewChange = (view: string) => {
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
    <div className="text-foreground pt-4">
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
