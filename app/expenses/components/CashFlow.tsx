// components/CashFlow.tsx
import React from "react";

export function CashFlow() {
  const mockRows = [
    {
      date: "2023-11-23",
      forwarded: 50000,
      cashIn: 15200,
      cashOut: 3000,
      balance: 62200,
    },
    {
      date: "2023-11-22",
      forwarded: 42000,
      cashIn: 12000,
      cashOut: 4000,
      balance: 50000,
    },
    {
      date: "2023-11-21",
      forwarded: 38000,
      cashIn: 9500,
      cashOut: 5500,
      balance: 42000,
    },
  ];

  return (
    <div className="p-6 glass-effect">
      <h2 className="mb-6 font-semibold text-white text-xl">Daily Cash Flow</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-slate-300 text-sm text-left">
          <thead className="bg-white/5 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Forwarded</th>
              <th className="px-6 py-3 text-green-400 text-right">Cash In</th>
              <th className="px-6 py-3 text-red-400 text-right">Cash Out</th>
              <th className="px-6 py-3 font-bold text-white text-right">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {mockRows.map((row, index) => (
              <tr key={index} className="hover:bg-white/5">
                <td className="px-6 py-4 font-medium text-white">{row.date}</td>
                <td className="px-6 py-4 text-right">
                  ₱{row.forwarded.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-green-400 text-right">
                  +₱{row.cashIn.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-red-400 text-right">
                  -₱{row.cashOut.toLocaleString()}
                </td>
                <td className="px-6 py-4 font-bold text-white text-right">
                  ₱{row.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
