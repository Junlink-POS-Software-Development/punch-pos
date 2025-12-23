"use client";

import React, { useMemo } from "react";
import { CashFlowEntry } from "../lib/types";
import { DragHandleProps } from "./DashboardGrid";

interface DailyGrossIncomeProps {
  cashFlow: CashFlowEntry[];
  dragHandleProps?: DragHandleProps;
}

const DailyGrossIncomeCard = ({
  cashFlow,
  dragHandleProps,
}: DailyGrossIncomeProps) => {
  const totalGross = useMemo(() => {
    return cashFlow.reduce((acc, curr) => acc + (curr.cash_in || 0), 0);
  }, [cashFlow]);

  return (
    <div className="bg-slate-800 shadow-lg border border-slate-700/50 rounded-xl h-full overflow-hidden text-white">
      {/* Draggable Header */}
      <div
        {...dragHandleProps?.attributes}
        {...dragHandleProps?.listeners}
        className="hover:bg-slate-700/30 p-6 pb-2 transition-colors cursor-grab active:cursor-grabbing"
      >
        <h2 className="font-bold text-xl">Daily Gross Income</h2>
      </div>

      <div className="p-6 pt-2">
        <div className="mb-6">
          <p className="text-slate-400 text-sm">Total Gross Income</p>
          <p className="font-bold text-emerald-400 text-3xl">
            ₱
            {totalGross.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-lg">Categorical Gross</h3>
          <div className="space-y-3">
            {cashFlow.map((entry) => (
              <div
                key={entry.category}
                className="flex justify-between items-center pb-2 border-slate-700 last:border-0 border-b"
              >
                <span className="text-slate-300">{entry.category}</span>
                <span className="font-medium text-emerald-100">
                  ₱
                  {entry.cash_in.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyGrossIncomeCard;
