import Link from "next/link";
import {
  Archive,
  ArrowLeftRight,
  BarChart,
  Brain,
  Inbox,
  LayoutGrid,
  Settings,
  StickyNote,
  TrendingDown,
  Users,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import React from "react";

// Mock data for the specific page shortcuts/dropdowns
const MOCK_SHORTCUTS = [
  { label: "Quick View", href: "#" },
  { label: "Export Data", href: "#" },
  { label: "Manage Settings", href: "#" },
];

const Navigation = React.memo(() => {
  const nav = [
    {
      id: "dashboard",
      text: "Dashboard",
      Icon: LayoutGrid,
      shortcuts: [
        { label: "Overview", href: "/dashboard?view=grid" },
        { label: "Financial Report", href: "/dashboard?view=report" },
      ],
    },
    {
      id: "inventory",
      text: "Inventory",
      Icon: Archive,
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
      shortcuts: [
        { label: "Transaction History", href: "/transactions?view=history" },
        { label: "Payments History", href: "/transactions?view=payments" },
      ],
    },
    {
      id: "settings",
      text: "Settings",
      Icon: Settings,
      shortcuts: [
        { label: "General", href: "/settings" },
        { label: "Security", href: "/settings" },
        { label: "Billing", href: "/settings" },
      ],
    },
    {
      id: "reports",
      text: "Reports",
      Icon: BarChart,
      shortcuts: [
        { label: "Sales", href: "/reports" },
        { label: "Growth", href: "/reports" },
        { label: "Tax", href: "/reports" },
      ],
    },
    {
      id: "customers",
      text: "Customers",
      Icon: Users,
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
      hasNotification: true,
      shortcuts: [
        { label: "New Note", href: "/notes" },
        { label: "To-Do", href: "/notes" },
        { label: "Shared", href: "/notes" },
      ],
    },
  ];

  return (
    <nav className="gap-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
      {nav.map((item) => (
        // Added 'group' to handle hover states for children
        <div key={item.id} className="group relative">
          <Link
            href={`/${item.id}`}
            className={`
              relative flex flex-col justify-center items-center p-6 rounded-xl 
              text-slate-400 transition-all duration-300 glass-effect border border-transparent
              
              /* Hover Effects: Text White, Cyan Border, Cyan Glow */
              group-hover:text-white 
              group-hover:border-cyan-500/50
              group-hover:shadow-[0_0_20px_rgba(6,189,212,0.25)]
              group-hover:bg-slate-800/50
              
              h-36 w-full
            `}
          >
            {/* Notification Dot */}
            {item.hasNotification && (
              <span className="top-4 right-4 absolute bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] rounded-full w-2.5 h-2.5 animate-pulse" />
            )}

            <item.Icon className="mb-3 w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium text-base tracking-wide">
              {item.text}
            </span>
          </Link>

          {/* Dropdown / Hover Menu (The "Business Ops" style menu from image) */}
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
});

Navigation.displayName = "Navigation";

export default Navigation;
