"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "./hooks/useMediaQuery";

// Dynamic import for SalesTerminal
const SalesTerminal = dynamic(
  () => import("@/components/sales-terminnal/SalesTerminal").then(m => m.SalesTerminal),
  { ssr: false }
);

export default function HomePage() {
  return <SalesTerminal />;
}
