"use client";

import React, { useMemo } from "react";
import { CashFlowEntry } from "../lib/dashboard.api";

interface Props {
  cashFlow: CashFlowEntry[];
}

const DailyGrossIncomeCard = ({ cashFlow }: Props) => {
  // Calculate total daily gross (sum of cash_in)
  const totalGross = useMemo(() => {
    return cashFlow.reduce((acc, curr) => acc + (curr.cash_in || 0), 0);
  }, [cashFlow]);

  return (
    <div className="bg-slate-800 shadow-lg p-6 rounded-xl text-white">
      <h2 className="mb-4 font-bold text-xl">Daily Gross Income</h2>
      
      <div className="mb-6">
        <p className="text-slate-400 text-sm">Total Gross Income</p>
        <p className="font-bold text-3xl text-emerald-400">
          ₱{totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-lg">Categorical Gross</h3>
        <div className="space-y-3">
          {cashFlow.map((entry) => (
            <div key={entry.category} className="flex justify-between items-center border-slate-700 pb-2 border-b last:border-0">
              <span className="text-slate-300">{entry.category}</span>
              <span className="font-medium text-emerald-100">
                ₱{entry.cash_in.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {cashFlow.length === 0 && (
            <p className="text-slate-500 text-sm italic">No income recorded for today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyGrossIncomeCard;