"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "./hooks/useMediaQuery";

// Dynamic import for SalesTerminal
const SalesTerminal = dynamic(
  () => import("@/components/sales-terminnal/SalesTerminal"),
  { ssr: false }
);

export default function HomePage() {
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // --- DESKTOP VIEW ---
  // Render SalesTerminal directly. MainWindow handles Sidebar and Header.
  if (!isMobile) {
    return <SalesTerminal />;
  }

  // --- MOBILE VIEW ---
  // The Terminal is handled by LeftWindow in MainWindow.
  // The Navigation is handled by the Sidebar.
  // So we don't need to render anything here for the "/" route on mobile.
  return null;
}
