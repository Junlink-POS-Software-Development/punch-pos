"use client";

import { LayoutDashboard, FileText } from "lucide-react";

export type DashboardView = "grid" | "report";

interface DashboardNavProps {
  currentView: DashboardView;
  setView: (view: DashboardView) => void;
}

export function DashboardNav({ currentView, setView }: DashboardNavProps) {
  const navItems = [
    { id: "grid", text: "Overview", Icon: LayoutDashboard },
    { id: "report", text: "Financial Report", Icon: FileText },
  ];

  return (
    <div className="flex bg-slate-800 p-1 rounded-lg">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id as DashboardView)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${
              currentView === item.id
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }
          `}
        >
          <item.Icon className="w-4 h-4" />
          {item.text}
        </button>
      ))}
    </div>
  );
}
