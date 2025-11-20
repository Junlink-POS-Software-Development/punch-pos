// app/transactions/components/tables/TransactionHistoryTable.tsx
"use client";

import React from "react";
import { TransactionItem } from "../../types";

// Mock data to simulate what comes from done.ts
const MOCK_DATA: TransactionItem[] = [
  {
    barcode: "12345-ABC",
    ItemName: "Product A",
    unitPrice: 150.0,
    discount: 0,
    quantity: 2,
    totalPrice: 300.0,
  },
  {
    barcode: "98765-XYZ",
    ItemName: "Product B",
    unitPrice: 50.0,
    discount: 5.0,
    quantity: 1,
    totalPrice: 45.0,
  },
  {
    barcode: "11223-QWE",
    ItemName: "Product C",
    unitPrice: 200.0,
    discount: 20.0,
    quantity: 3,
    totalPrice: 540.0,
  },
];

export const TransactionHistoryTable = () => {
  return (
    <div className="p-6 rounded-lg glass-effect">
      <div className="overflow-x-auto">
        <table className="w-full text-slate-300 text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 rounded-tl-lg">Barcode</th>
              <th className="px-6 py-3">Item Name</th>
              <th className="px-6 py-3 text-right">Unit Price</th>
              <th className="px-6 py-3 text-right">Qty</th>
              <th className="px-6 py-3 text-yellow-500 text-right">Discount</th>
              <th className="px-6 py-3 rounded-tr-lg font-bold text-white text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DATA.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-slate-800/30 border-slate-700 border-b transition-colors"
              >
                <td className="px-6 py-4 font-mono text-slate-400">
                  {item.barcode}
                </td>
                <td className="px-6 py-4 font-medium text-white">
                  {item.ItemName}
                </td>
                <td className="px-6 py-4 text-right">
                  ₱{item.unitPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">{item.quantity}</td>
                <td className="px-6 py-4 text-yellow-500 text-right">
                  {item.discount > 0 ? `-₱${item.discount.toFixed(2)}` : "-"}
                </td>
                <td className="px-6 py-4 font-bold text-cyan-400 text-right">
                  ₱{item.totalPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {MOCK_DATA.length === 0 && (
        <p className="mt-4 text-gray-500 text-center">
          No transaction items found.
        </p>
      )}
    </div>
  );
};
