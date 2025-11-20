// app/transactions/components/tables/PaymentHistoryTable.tsx
"use client";

import React from "react";
import { PaymentRecord } from "../../types";

// Mock data to simulate what comes from done.ts
const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    transactionNo: "TRX-2023-001",
    transactionTime: "11/20/2025, 10:30 AM",
    costumerName: "John Doe",
    amountRendered: 1000.0,
    voucher: 0,
    grandTotal: 885.0,
    change: 115.0,
  },
  {
    transactionNo: "TRX-2023-002",
    transactionTime: "11/20/2025, 11:15 AM",
    costumerName: "Jane Smith",
    amountRendered: 500.0,
    voucher: 50.0,
    grandTotal: 520.0,
    change: 30.0,
  },
];

export const PaymentHistoryTable = () => {
  return (
    <div className="p-6 rounded-lg glass-effect">
      <div className="overflow-x-auto">
        <table className="w-full text-slate-300 text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 rounded-tl-lg">Trans. No</th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-right">Payment</th>
              <th className="px-6 py-3 text-blue-400 text-right">Voucher</th>
              <th className="px-6 py-3 rounded-tr-lg text-green-400 text-right">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PAYMENTS.map((pay, index) => (
              <tr
                key={index}
                className="hover:bg-slate-800/30 border-slate-700 border-b transition-colors"
              >
                <td className="px-6 py-4 font-mono text-slate-400">
                  {pay.transactionNo}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {pay.transactionTime}
                </td>
                <td className="px-6 py-4 font-medium text-white">
                  {pay.costumerName || (
                    <span className="text-slate-600 italic">Walk-in</span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-right">
                  ₱{pay.grandTotal.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  ₱{pay.amountRendered.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-blue-400 text-right">
                  {pay.voucher > 0 ? `₱${pay.voucher.toFixed(2)}` : "-"}
                </td>
                <td className="px-6 py-4 font-bold text-green-400 text-right">
                  ₱{pay.change.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {MOCK_PAYMENTS.length === 0 && (
        <p className="mt-4 text-gray-500 text-center">
          No payment records found.
        </p>
      )}
    </div>
  );
};
