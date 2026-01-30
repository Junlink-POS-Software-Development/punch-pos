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
    <nav className="flex items-center gap-6 pb-1 border-slate-700/50 border-b w-full overflow-x-auto">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id as DashboardView)}
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap 
            transition-colors duration-200 ease-in-out
            ${
              currentView === item.id
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-slate-500"
            }
          `}
        >
          <item.Icon className="w-4 h-4" />
          <span>{item.text}</span>
        </button>
      ))}
    </nav>
  );
}
