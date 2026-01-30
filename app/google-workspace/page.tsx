import React from "react";
import GoogleAppsGrid from "./components/GoogleAppsGrid";
import BookmarksSection from "./components/BookmarksSection";
import { Grid, ArrowBigLeft } from "lucide-react";
import Link from "next/link";

export default function GoogleWorkspacePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2">
      {/* LOCAL TITLE AND BACK BUTTON REMOVED IN FAVOR OF GLOBAL HEADER */}
      <div className="flex flex-col gap-2 mb-4">
        <p className="text-slate-400">Access your tools and organized works in one place.</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
          Quick Access
        </h2>
        <GoogleAppsGrid />
      </section>

      <div className="h-px bg-slate-800/50 my-8" />

      <section>
        <BookmarksSection />
      </section>
    </div>
  );
}
