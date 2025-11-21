"use client";

import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { usePaymentHistory } from "../../hooks/useTransactionQueries";

export const PaymentHistoryTable = () => {
  // Using the custom hook
  const { data, isLoading, isError, error } = usePaymentHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-10 text-red-400">
        <AlertCircle className="w-5 h-5" />
        <span>Error loading payments: {(error as Error).message}</span>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg glass-effect">
      <div className="overflow-x-auto">
        <table className="w-full text-slate-300 text-sm text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 rounded-tl-lg">Invoice No</th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3 text-right">Total</th>
              <th className="px-6 py-3 text-right">Payment</th>
              <th className="px-6 py-3 text-blue-400 text-right">Voucher</th>
              <th className="px-6 py-3 rounded-tr-lg font-bold text-green-400 text-right">
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((pay, index) => (
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
                  {pay.customerName || (
                    <span className="opacity-50 italic">Walk-in</span>
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
    </div>
  );
};
