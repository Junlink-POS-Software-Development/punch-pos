"use client";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { fetchFinancialReport, FinancialReportItem } from "../lib/dashboard.api";

interface Props {
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export const FinancialReportTable = ({ 
  defaultStartDate = dayjs().startOf('month').format('YYYY-MM-DD'),
  defaultEndDate = dayjs().endOf('month').format('YYYY-MM-DD')
}: Props) => {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [data, setData] = useState<FinancialReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchFinancialReport(startDate, endDate);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Grand Totals
  const totals = data.reduce((acc, curr) => ({
    forwarded: acc.forwarded + curr.cash_forwarded,
    gross: acc.gross + curr.gross_income,
    expenses: acc.expenses + curr.expenses,
    onHand: acc.onHand + curr.cash_on_hand
  }), { forwarded: 0, gross: 0, expenses: 0, onHand: 0 });

  const formatCurrency = (val: number) => 
    `₱${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800">
      
      {/* Date Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-emerald-400 mr-auto">Financial Report</h2>
        
        <div className="flex items-center gap-2">
           <label className="text-sm text-slate-400">From</label>
           <input 
             type="date" 
             value={startDate}
             onChange={e => setStartDate(e.target.value)}
             className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm focus:border-emerald-500 outline-none"
           />
        </div>
        <div className="flex items-center gap-2">
           <label className="text-sm text-slate-400">To</label>
           <input 
             type="date" 
             value={endDate}
             onChange={e => setEndDate(e.target.value)}
             className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm focus:border-emerald-500 outline-none"
           />
        </div>
      </div>

      {/* The Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right text-blue-300">Cash Forwarded</th>
              <th className="py-3 px-4 text-right text-emerald-300">Gross Income</th>
              <th className="py-3 px-4 text-right text-rose-300">Expenses</th>
              <th className="py-3 px-4 text-right font-bold text-white">Cash on Hand</th>
            </tr>
          </thead>
          <tbody className="text-slate-200">
            {loading ? (
              <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-slate-500">No data for this range</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.category} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{row.category}</td>
                  <td className="py-3 px-4 text-right text-slate-400">{formatCurrency(row.cash_forwarded)}</td>
                  <td className="py-3 px-4 text-right text-emerald-100">{formatCurrency(row.gross_income)}</td>
                  <td className="py-3 px-4 text-right text-rose-100">{formatCurrency(row.expenses)}</td>
                  <td className="py-3 px-4 text-right font-bold">{formatCurrency(row.cash_on_hand)}</td>
                </tr>
              ))
            )}
          </tbody>
          
          {/* Footer Totals */}
          {!loading && data.length > 0 && (
            <tfoot>
              <tr className="bg-slate-800/80 font-bold border-t-2 border-emerald-500/50">
                <td className="py-4 px-4 text-emerald-400">TOTALS</td>
                <td className="py-4 px-4 text-right text-blue-200">{formatCurrency(totals.forwarded)}</td>
                <td className="py-4 px-4 text-right text-emerald-200">{formatCurrency(totals.gross)}</td>
                <td className="py-4 px-4 text-right text-rose-200">{formatCurrency(totals.expenses)}</td>
                <td className="py-4 px-4 text-right text-xl text-white underline decoration-emerald-500 decoration-2 underline-offset-4">
                  {formatCurrency(totals.onHand)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Logic Explanation Footer */}
      <div className="mt-4 text-xs text-slate-500 text-center flex justify-center gap-6">
         <span>Forwarded = Balance before {dayjs(startDate).format("MMM D")}</span>
         <span className="font-mono text-emerald-500/80">
            (Total Forwarded + Total Gross) - Total Expenses = Total Cash on Hand
         </span>
      </div>
    </div>
  );
};