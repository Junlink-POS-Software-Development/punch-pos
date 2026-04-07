"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useEffect, useState } from "react";

// Dynamic imports
const DesktopSalesTerminal = dynamic(
  () => import("@/components/sales-terminnal/DesktopSalesTerminal").then(m => m.DesktopSalesTerminal),
  { ssr: false }
);

const MobileSalesTerminal = dynamic(
  () => import("@/components/sales-terminnal/mobile-layout/MobileSalesTerminal").then(m => m.MobileSalesTerminal),
  { ssr: false }
);

function TerminalSkeleton() {
  return (
    <div className="flex flex-col h-screen w-full bg-background animate-pulse p-4 gap-4">
      <div className="h-16 w-full bg-muted rounded-xl" />
      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-muted rounded-2xl" />
        <div className="hidden lg:block w-[450px] bg-muted rounded-2xl" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton while determining viewport or during mount
  if (!mounted) {
    return <TerminalSkeleton />;
  }

  return isMobile ? <MobileSalesTerminal /> : <DesktopSalesTerminal />;
}
