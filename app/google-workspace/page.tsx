import React from "react";
import GoogleAppsGrid from "./components/GoogleAppsGrid";
import BookmarksSection from "./components/BookmarksSection";
import { Grid, ArrowBigLeft } from "lucide-react";
import Link from "next/link";

export default function GoogleWorkspacePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-fit"
        >
          <ArrowBigLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-white/10">
            <Grid className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Google Workspace</h1>
            <p className="text-slate-400 mt-1">Access your tools and organized works in one place.</p>
          </div>
        </div>
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
