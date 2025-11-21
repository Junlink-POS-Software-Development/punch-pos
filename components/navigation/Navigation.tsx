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
      shortcuts: ["Overview", "Real-time", "Widgets"],
    },
    {
      id: "inventory",
      text: "Inventory",
      Icon: Archive,
      shortcuts: ["Add Item", "Stock Count", "Suppliers"],
    },
    {
      id: "expenses",
      text: "Expenses",
      Icon: TrendingDown,
      shortcuts: ["New Expense", "Categories", "Receipts"],
    },
    {
      id: "transactions",
      text: "Transactions",
      Icon: ArrowLeftRight,
      shortcuts: ["History", "Pending", "Refunds"],
    },
    {
      id: "settings",
      text: "Settings",
      Icon: Settings,
      shortcuts: ["General", "Security", "Billing"],
    },
    {
      id: "reports",
      text: "Reports",
      Icon: BarChart,
      shortcuts: ["Sales", "Growth", "Tax"],
    },
    {
      id: "customers",
      text: "Customers",
      Icon: Users,
      shortcuts: ["List", "Groups", "Feedback"],
    },
    {
      id: "junfue-ai",
      text: "JunFue AI",
      Icon: Brain,
      shortcuts: ["Chat", "Insights", "Automations"],
    },
    {
      id: "inbox",
      text: "Inbox",
      Icon: Inbox,
      hasNotification: true,
      shortcuts: ["Unread", "Archived", "Compose"],
    },
    {
      id: "notes",
      text: "Notes",
      Icon: StickyNote,
      hasNotification: true,
      shortcuts: ["New Note", "To-Do", "Shared"],
    },
  ];

  return (
    <nav className="gap-4 grid grid-cols-5 mb-8">
      {nav.map((item) => (
        // Added 'group' to handle hover states for children
        <div key={item.id} className="group relative">
          <Link
            href={`/${item.id}`}
            className={`
              relative flex flex-col justify-center items-center p-4 rounded-xl 
              text-slate-400 transition-all duration-300 glass-effect border border-transparent
              
              /* Hover Effects: Text White, Cyan Border, Cyan Glow */
              group-hover:text-white 
              group-hover:border-cyan-500/50
              group-hover:shadow-[0_0_20px_rgba(6,189,212,0.25)]
              group-hover:bg-slate-800/50
              
              h-32 w-full
            `}
          >
            {/* Notification Dot */}
            {item.hasNotification && (
              <span className="top-3 right-3 absolute bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] rounded-full w-2.5 h-2.5 animate-pulse" />
            )}

            <item.Icon className="mb-3 w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-medium text-sm tracking-wide">
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
                    <button className="flex justify-between items-center hover:bg-white/10 px-2 py-1.5 rounded-md w-full text-slate-300 hover:text-white text-sm text-left transition-colors">
                      {shortcut}
                      <ChevronRight className="opacity-50 w-3 h-3" />
                    </button>
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
