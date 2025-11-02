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
} from "lucide-react";

const Navigation = () => {
  const nav = [
    { id: "dashboard", text: "Dashboard", Icon: LayoutGrid },
    { id: "inventory", text: "Inventory", Icon: Archive },
    { id: "expenses", text: "Expenses", Icon: TrendingDown },
    { id: "transactions", text: "Transactions", Icon: ArrowLeftRight },
    { id: "settings", text: "Settings", Icon: Settings },
    { id: "reports", text: "Reports", Icon: BarChart },
    { id: "costumers", text: "Costumers", Icon: Users },
    { id: "junfue-ai", text: "JunFue AI", Icon: Brain },
    {
      id: "inbox",
      text: "Inbox",
      Icon: Inbox,
      hasNotification: true, // <-- Added this
    },
    {
      id: "notes",
      text: "Notes",
      Icon: StickyNote,
      hasNotification: true, // <-- Added this
    },
  ];

  return (
    <nav className="gap-4 grid grid-cols-5 mb-8">
      {nav.map((item) => (
        <Link
          key={item.id}
          href={`/${item.id}`}
          // 1. Added "relative" to make it a positioning container
          className="relative flex flex-col justify-center items-center p-4 rounded-lg text-slate-300 hover:text-white text-center transition-all duration-200 glass-effect"
        >
          {/* 2. Conditionally render the notification dot */}
          {item.hasNotification && (
            <span className="top-3 right-3 absolute bg-red-500 rounded-full w-2.5 h-2.5" />
          )}

          <item.Icon className="mb-2 w-8 h-8" />
          <span className="font-medium text-xs">{item.text}</span>
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
