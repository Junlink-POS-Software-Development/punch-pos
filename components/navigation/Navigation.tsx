import Link from "next/link";
import {
  Archive,
  ArrowLeftRight,
  Brain,
  Inbox,
  LayoutGrid,
  Settings,
  StickyNote,
  TrendingDown,
  Users,
  ChevronRight,
  MoreHorizontal,
  Grid,
  Terminal,
  ChevronLeft,
  Menu,
} from "lucide-react";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

// Mock data for the specific page shortcuts/dropdowns
const MOCK_SHORTCUTS = [
  { label: "Quick View", href: "#" },
  { label: "Export Data", href: "#" },
  { label: "Manage Settings", href: "#" },
];

interface NavigationProps {
  variant?: "grid" | "sidebar";
}

const Navigation = React.memo(({ variant = "grid" }: NavigationProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const nav = [
    {
      id: "terminal", // Added Terminal for Sidebar
      text: "Terminal",
      Icon: Terminal,
      href: "/",
      shortcuts: [],
      hiddenInGrid: true, // Hide from the main dashboard grid
    },
    {
      id: "dashboard",
      text: "Dashboard",
      Icon: LayoutGrid,
      href: "/dashboard",
      shortcuts: [
        { label: "Overview", href: "/dashboard?view=grid" },
        { label: "Financial Report", href: "/dashboard?view=report" },
      ],
    },
    {
      id: "inventory",
      text: "Inventory",
      Icon: Archive,
      href: "/inventory",
      shortcuts: [
        { label: "Register Item", href: "/inventory?view=register" },
        { label: "Manage Stocks", href: "/inventory?view=manage" },
        { label: "Stocks Monitor", href: "/inventory?view=monitor" },
      ],
    },
    {
      id: "expenses",
      text: "Expenses",
      Icon: TrendingDown,
      href: "/expenses",
      shortcuts: [
        { label: "Cashout", href: "/expenses?view=cashout" },
        { label: "Expenses Monitor", href: "/expenses?view=monitor" },
        { label: "Cash Flow", href: "/expenses?view=cashflow" },
      ],
    },
    {
      id: "transactions",
      text: "Transactions",
      Icon: ArrowLeftRight,
      href: "/transactions",
      shortcuts: [
        { label: "Transaction History", href: "/transactions?view=history" },
        { label: "Payments History", href: "/transactions?view=payments" },
      ],
    },
    {
      id: "settings",
      text: "Settings",
      Icon: Settings,
      href: "/settings",
      shortcuts: [
        { label: "General", href: "/settings" },
        { label: "Security", href: "/settings" },
        { label: "Billing", href: "/settings" },
      ],
    },
    {
      id: "google-workspace",
      text: "Workspace",
      Icon: Grid,
      href: "#", // External links handled differently if needed, but for now # or direct
      shortcuts: [
        { label: "Gmail", href: "https://mail.google.com" },
        { label: "Drive", href: "https://drive.google.com" },
        { label: "Calendar", href: "https://calendar.google.com" },
      ],
    },
    {
      id: "customers",
      text: "Customers",
      Icon: Users,
      href: "/customers",
      shortcuts: [
        { label: "List", href: "/customers" },
        { label: "Groups", href: "/customers" },
        { label: "Feedback", href: "/customers" },
      ],
    },
    {
      id: "junfue-ai",
      text: "JunFue AI",
      Icon: Brain,
      href: "/junfue-ai",
      shortcuts: [
        { label: "Chat", href: "/junfue-ai" },
        { label: "Insights", href: "/junfue-ai" },
        { label: "Automations", href: "/junfue-ai" },
      ],
    },
    {
      id: "inbox",
      text: "Inbox",
      Icon: Inbox,
      href: "/inbox",
      hasNotification: true,
      shortcuts: [
        { label: "Unread", href: "/inbox" },
        { label: "Archived", href: "/inbox" },
        { label: "Compose", href: "/inbox" },
      ],
    },
    {
      id: "notes",
      text: "Notes",
      Icon: StickyNote,
      href: "/notes",
      hasNotification: true,
      shortcuts: [
        { label: "New Note", href: "/notes" },
        { label: "To-Do", href: "/notes" },
        { label: "Shared", href: "/notes" },
      ],
    },
  ];

  // Filter items for Grid view (exclude Terminal)
  const displayItems =
    variant === "grid" ? nav.filter((item) => !item.hiddenInGrid) : nav;

  if (variant === "grid") {
    return (
      <nav className="gap-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8 font-lexend">
        {displayItems.map((item) => (
          <div key={item.id} className="group relative">
            <Link
              href={item.href}
              className={`
                relative flex flex-col justify-center items-center p-6 rounded-xl 
                text-cyan-400 transition-all duration-300 glass-effect border border-transparent
                
                group-hover:text-amber-500 
                group-hover:border-amber-500/50
                group-hover:shadow-[0_0_20px_rgba(245,158,11,0.35)]
                group-hover:bg-slate-800/60
                
                h-36 w-full
              `}
            >
              {item.hasNotification && (
                <span className="top-4 right-4 absolute bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] rounded-full w-2.5 h-2.5 animate-pulse" />
              )}

              <item.Icon className="mb-3 w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium text-base tracking-wide">
                {item.text}
              </span>
            </Link>

            <div className="invisible group-hover:visible top-full left-0 z-20 absolute opacity-0 group-hover:opacity-100 mt-2 w-48 transition-all translate-y-[-10px] group-hover:translate-y-0 duration-200 transform">
              <div className="bg-slate-900/90 shadow-xl backdrop-blur-xl p-3 border border-slate-700 rounded-xl glass-effect">
                <div className="flex justify-between items-center mb-2 px-2 font-semibold text-slate-500 text-xs uppercase">
                  <span>Shortcuts</span>
                  <MoreHorizontal className="w-3 h-3" />
                </div>
                <ul className="space-y-1">
                  {(item.shortcuts || MOCK_SHORTCUTS).map((shortcut, idx) => (
                    <li key={idx}>
                      <Link
                        href={shortcut.href}
                        className="flex justify-between items-center hover:bg-white/10 px-2 py-1.5 rounded-md w-full text-slate-300 hover:text-white text-sm text-left transition-colors"
                      >
                        {shortcut.label}
                        <ChevronRight className="opacity-50 w-3 h-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </nav>
    );
  }

  // --- SIDEBAR VARIANT ---
  return (
    <aside
      className={`
        relative flex flex-col h-full bg-[#0B1120] border-r border-slate-800 transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="top-4 -right-3 z-50 absolute bg-slate-800 border border-slate-700 shadow-md p-1 rounded-full text-slate-400 hover:text-white transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Header / Logo Area (Optional in Sidebar if Header is top) */}
      <div className="flex items-center justify-center h-16 border-b border-slate-800/50">
         <div className="p-2">
            <Menu className="w-6 h-6 text-slate-500" />
         </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 space-y-2 overflow-y-auto py-4 px-3 custom-scrollbar">
        {displayItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href) && item.href !== "/";

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <div className="relative">
                <item.Icon
                  className={`
                    w-6 h-6 transition-transform duration-300
                    ${isActive ? "scale-110" : "group-hover:scale-110"}
                  `}
                />
                {item.hasNotification && (
                  <span className="top-0 right-0 absolute bg-red-500 shadow-sm rounded-full w-2 h-2" />
                )}
              </div>

              {!isCollapsed && (
                <span className="font-medium text-sm tracking-wide whitespace-nowrap">
                  {item.text}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="left-full z-50 absolute ml-4 bg-slate-800 px-3 py-1.5 rounded-md text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.text}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User (Optional) */}
      <div className="p-4 border-t border-slate-800/50">
          {/* Could put user profile here if not in top header */}
      </div>
    </aside>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;
