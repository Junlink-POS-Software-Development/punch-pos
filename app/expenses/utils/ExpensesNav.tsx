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
    <nav className="gap-4 grid grid-cols-3 mb-8">
      {" "}
      {/* Changed grid-cols-2 to 3 */}
      {navButtons.map((button) => (
        <button
          key={button.id}
          className={`btn-3d-glass flex flex-col items-center justify-center p-4 text-center transition-all duration-200
            ${
              currentView === button.id
                ? "bg-white/20 text-white"
                : "text-slate-300 hover:text-white"
            }
          `}
          onClick={() => setView(button.id as View)}
        >
          <button.Icon className="mb-2 w-8 h-8" />
          <span className="font-medium text-sm">{button.text}</span>
        </button>
      ))}
    </nav>
  );
}
