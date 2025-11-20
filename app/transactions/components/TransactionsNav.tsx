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
    <nav className="flex items-center gap-6 pb-1 border-slate-700 border-b w-full overflow-x-auto">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap 
            transition-colors duration-200 ease-in-out
            ${
              activeView === item.id
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-slate-500"
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

export default TransactionsNav;
