// app/transactions/components/TransactionsNav.tsx
"use client";

import React from "react";
import { History, CreditCard } from "lucide-react";

export type TransactionsView = "history" | "payments";

interface TransactionsNavProps {
  activeView: TransactionsView;
  setActiveView: (view: TransactionsView) => void;
}

const TransactionsNav: React.FC<TransactionsNavProps> = ({
  activeView,
  setActiveView,
}) => {
  const navItems = [
    { id: "history", text: "Transaction History (Line Items)", Icon: History },
    { id: "payments", text: "Payments History", Icon: CreditCard },
  ];

  return (
    <nav className="flex items-center gap-4 pb-1 border-border border-b w-full overflow-x-auto">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap cursor-pointer
            transition-colors duration-150 ease-in-out border-b-2 -mb-[1px]
            ${
              activeView === item.id
                ? "text-primary border-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
            }
          `}
          onClick={() => setActiveView(item.id as TransactionsView)}
        >
          <item.Icon className="w-4 h-4" />
          <span>{item.text}</span>
        </button>
      ))}
    </nav>
  );
};

export { TransactionsNav };
