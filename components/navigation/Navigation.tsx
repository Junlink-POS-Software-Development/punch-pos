// components/navigation/Navigation.tsx
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
  X,
  Table,
} from "lucide-react";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useViewStore } from "../window-layouts/store/useViewStore";

// Mock data for the specific page shortcuts/dropdowns
const MOCK_SHORTCUTS = [
  { label: "Quick View", href: "#" },
  { label: "Export Data", href: "#" },
  { label: "Manage Settings", href: "#" },
];

interface NavigationProps {
  variant?: "grid" | "sidebar" | "mobile";
}

const Navigation = React.memo(({ variant = "grid" }: NavigationProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setMobileView } = useViewStore();

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
      href: "/google-workspace",
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
    {
      id: "playground",
      text: "Playground",
      Icon: Table,
      href: "/playground",
      shortcuts: [
        { label: "New Sheet", href: "/playground" },
        { label: "My Models", href: "/playground" },
      ],
    },
  ];

  // Filter items for Grid view (exclude Terminal)
  const displayItems =
    variant === "grid" ? nav.filter((item) => !item.hiddenInGrid) : nav;

  const handleMobileNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href === "/") {
      setMobileView("left");
    } else {
      setMobileView("right");
    }
  };

  if (variant === "grid") {
    return (
      <nav className="gap-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8 font-lexend">
        {displayItems.map((item) => (
          <div key={item.id} className="group relative">
            <Link
              href={item.href}
              className={`
                relative flex flex-col justify-center items-center p-6 rounded-xl 
                text-primary transition-all duration-300 border border-border
                bg-background shadow-sm hover:shadow-md
                
                group-hover:text-secondary 
                group-hover:border-secondary
                group-hover:bg-muted/50
                
                h-36 w-full
              `}
            >
              {item.hasNotification && (
                <span className="top-4 right-4 absolute bg-red-500 rounded-full w-2.5 h-2.5 animate-pulse" />
              )}

              <item.Icon className="mb-3 w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-medium text-base tracking-wide">
                {item.text}
              </span>
            </Link>
          </div>
        ))}
      </nav>
    );
  }

  if (variant === "mobile") {
    return (
      <>
        {/* Toggle Button - Fixed Left Edge (Mirrors MobileCartPanel) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-80 bg-background border border-l-0 border-border rounded-r-lg p-2 text-foreground shadow-lg transition-transform duration-300 hover:bg-muted"
          style={{ transform: isMobileMenuOpen ? "translateX(280px)" : "translateX(0)" }}
        >
          {isMobileMenuOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Panel */}
        <div
          className={`
            fixed top-0 left-0 h-full w-[280px] z-70
            bg-background border-r border-border
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col shadow-2xl
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-lg font-bold text-foreground tracking-wide">MENU</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-1">
            {nav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href) && item.href !== "/";

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleMobileNavClick(item.href)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                    }
                  `}
                >
                  <item.Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-medium text-sm tracking-wide">
                    {item.text}
                  </span>
                  {item.hasNotification && (
                    <span className="ml-auto bg-red-500 rounded-full w-2 h-2" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border text-center">
             <span className="text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </div>
      </>
    );
  }

  // --- SIDEBAR VARIANT (Desktop) ---
  return (
    <aside
      className={`
        relative flex flex-col h-full bg-background border-r border-border transition-all duration-300
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="top-4 -right-3 z-50 absolute bg-background border border-border shadow-md p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Header / Logo Area (Optional in Sidebar if Header is top) */}
      <div className="flex items-center justify-center h-16 border-b border-border">
         <div className="p-2">
            <Menu className="w-6 h-6 text-muted-foreground" />
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
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
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
                <span className="font-semibold text-base tracking-wide whitespace-nowrap">
                  {item.text}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="left-full z-50 absolute ml-4 bg-popover px-3 py-1.5 border border-border rounded-md text-popover-foreground text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {item.text}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User (Optional) */}
      <div className="p-4 border-t border-border">
          {/* Could put user profile here if not in top header */}
      </div>
    </aside>
  );
});

Navigation.displayName = "Navigation";

export default Navigation;
