"use client";

import { Landmark, PieChart, ArrowRightLeft } from "lucide-react"; // Import new icon

export type View = "cashout" | "monitor" | "cashflow"; // Add 'cashflow'

type ExpensesNavProps = {
  currentView: View;
  setView: (view: View) => void;
};

export function ExpensesNav({ currentView, setView }: ExpensesNavProps) {
  const navButtons = [
    {
      id: "cashout",
      text: "Cashout",
      Icon: Landmark,
    },
    {
      id: "monitor",
      text: "Expenses Monitor",
      Icon: PieChart,
    },
    {
      id: "cashflow",
      text: "Cash Flow",
      Icon: ArrowRightLeft,
    },
  ];

  return (
    <nav className="flex items-center gap-6 pb-1 border-slate-700/50 border-b w-full overflow-x-auto mb-8">
      {navButtons.map((button) => (
        <button
          key={button.id}
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap 
            transition-colors duration-200 ease-in-out
            ${
              currentView === button.id
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-slate-500"
            }
          `}
          onClick={() => setView(button.id as View)}
        >
          <button.Icon className="w-4 h-4" />
          <span className="font-medium text-sm">{button.text}</span>
        </button>
      ))}
    </nav>
  );
}
