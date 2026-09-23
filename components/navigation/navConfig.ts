// components/navigation/navConfig.ts
import {
  Archive,
  ArrowLeftRight,
  Inbox,
  LayoutGrid,
  Settings,
  StickyNote,
  TrendingDown,
  Users,
  Grid,
  Terminal,
  FolderArchive,
  ChefHat,
  LucideIcon,
} from "lucide-react";

export interface NavShortcut {
  label: string;
  href: string;
  paramKey?: string;
  paramValue?: string;
  isDefault?: boolean;
  isExternal?: boolean;
}

export interface NavItemConfig {
  id: string;
  text: string;
  desc?: string;
  Icon: LucideIcon;
  href: string;
  shortcuts?: NavShortcut[];
  hasNotification?: boolean;
  hiddenInGrid?: boolean;
}

export function getNavItems(showKitchenKds: boolean = false): NavItemConfig[] {
  return [
    {
      id: "terminal",
      text: "Terminal",
      desc: "Cash Register & POS",
      Icon: Terminal,
      href: "/",
      shortcuts: [],
      hiddenInGrid: true,
    },
    {
      id: "dashboard",
      text: "Dashboard",
      desc: "Business Overview & Reports",
      Icon: LayoutGrid,
      href: "/dashboard",
      shortcuts: [],
    },
    {
      id: "inventory",
      text: "Inventory",
      desc: "Stock & item management",
      Icon: Archive,
      href: "/inventory",
      shortcuts: [
        { label: "Register Item", href: "/inventory?view=register", paramKey: "view", paramValue: "register", isDefault: true },
        { label: "Manage Stocks", href: "/inventory?view=manage", paramKey: "view", paramValue: "manage" },
        { label: "Stocks Monitor", href: "/inventory?view=monitor", paramKey: "view", paramValue: "monitor" },
      ],
    },
    {
      id: "transactions",
      text: "Transactions",
      desc: "Sales log & payment history",
      Icon: ArrowLeftRight,
      href: "/transactions",
      shortcuts: [
        { label: "Sales Log", href: "/transactions?view=history", paramKey: "view", paramValue: "history", isDefault: true },
        { label: "Payments History", href: "/transactions?view=payments", paramKey: "view", paramValue: "payments" },
      ],
    },
    {
      id: "cashout",
      text: "Cash Out",
      desc: "Record expenses & cashflow",
      Icon: TrendingDown,
      href: "/cashout",
      shortcuts: [],
    },
    {
      id: "settings",
      text: "Settings",
      desc: "Store profile & preferences",
      Icon: Settings,
      href: "/settings",
      shortcuts: [
        { label: "Profile", href: "/settings?tab=profile", paramKey: "tab", paramValue: "profile", isDefault: true },
        { label: "Store", href: "/settings?tab=store", paramKey: "tab", paramValue: "store" },
        { label: "Preferences", href: "/settings?tab=preferences", paramKey: "tab", paramValue: "preferences" },
        { label: "Subscription", href: "/settings?tab=subscription", paramKey: "tab", paramValue: "subscription" },
        { label: "Audit Logs", href: "/settings?tab=audit", paramKey: "tab", paramValue: "audit" },
      ],
    },
    ...(showKitchenKds
      ? [
          {
            id: "kitchen",
            text: "Kitchen KDS",
            desc: "Active orders & cook line",
            Icon: ChefHat,
            href: "/kitchen",
            shortcuts: [
              { label: "Active Orders", href: "/kitchen", isDefault: true },
            ],
          },
        ]
      : []),
    {
      id: "customers",
      text: "Customers",
      desc: "Customer directory & groups",
      Icon: Users,
      href: "/customers",
      shortcuts: [
        { label: "Customer List", href: "/customers", isDefault: true },
      ],
    },
    {
      id: "google-workspace",
      text: "Workspace",
      desc: "Gmail, Drive & Calendar",
      Icon: Grid,
      href: "/google-workspace",
      shortcuts: [
        { label: "Gmail", href: "https://mail.google.com", isExternal: true },
        { label: "Drive", href: "https://drive.google.com", isExternal: true },
        { label: "Calendar", href: "https://calendar.google.com", isExternal: true },
      ],
    },
    {
      id: "inbox",
      text: "Inbox",
      desc: "Messages and alerts",
      Icon: Inbox,
      href: "/inbox",
      hasNotification: true,
      shortcuts: [
        { label: "Unread", href: "/inbox", isDefault: true },
        { label: "Archived", href: "/inbox" },
        { label: "Compose", href: "/inbox" },
      ],
    },
    {
      id: "notes",
      text: "Notes",
      desc: "Quick memos & checklist",
      Icon: StickyNote,
      href: "/notes",
      hasNotification: true,
      shortcuts: [
        { label: "All Notes", href: "/notes", isDefault: true },
        { label: "New Note", href: "/notes" },
      ],
    },
    {
      id: "file-manager",
      text: "File Manager",
      desc: "Organize images & media",
      Icon: FolderArchive,
      href: "/file-manager",
      shortcuts: [
        { label: "Public Files", href: "/file-manager", isDefault: true },
      ],
    },
  ];
}

/**
 * Check whether a specific shortcut is currently active given pathname and searchParams.
 */
export function isShortcutActive(
  shortcut: NavShortcut,
  pathname: string,
  searchParams?: URLSearchParams | null
): boolean {
  if (shortcut.isExternal) return false;
  
  const [basePath] = shortcut.href.split("?");
  if (pathname !== basePath) return false;

  if (!shortcut.paramKey) {
    return true;
  }

  const currentValue = searchParams?.get(shortcut.paramKey) || "";
  if (currentValue === (shortcut.paramValue || "")) {
    return true;
  }

  // If no param is set in URL, check if this shortcut is marked default
  if (!currentValue && shortcut.isDefault) {
    return true;
  }

  return false;
}

/**
 * Find the active nav item and its shortcuts based on current pathname.
 */
export function getActiveNavItem(
  pathname: string,
  navItems: NavItemConfig[]
): NavItemConfig | undefined {
  if (pathname === "/") {
    return navItems.find((item) => item.id === "terminal");
  }
  return navItems.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  );
}
