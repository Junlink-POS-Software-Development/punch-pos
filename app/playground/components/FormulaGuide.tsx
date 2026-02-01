
import React, { useState } from 'react';
import { CircleHelp, X } from "lucide-react";

export function FormulaGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200"
      >
        <CircleHelp size={16} />
        <span className="hidden sm:inline">Formula Guide</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col text-slate-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white tracking-wide">Playground Formula Guide</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 text-sm custom-scrollbar">
              <section>
                <h3 className="font-semibold text-lg text-cyan-400 mb-2">DB_DATA()</h3>
                <p className="text-slate-400 mb-3 leading-relaxed">
                  Fetch live aggregated data from your store's database directly into your spreadsheet cells.
                </p>
                <div className="bg-slate-900/80 border border-slate-700/50 p-4 rounded-lg font-mono text-xs text-amber-400 shadow-inner">
                  =DB_DATA("table_name", "operation", "column", [filter_json])
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-8">
                <section>
                    <h4 className="font-medium text-base text-white mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                        Arguments
                    </h4>
                    <ul className="space-y-3 text-slate-400">
                    <li className="flex flex-col gap-1">
                        <span className="text-slate-200 font-medium">table_name</span>
                        <span className="text-xs">Target table (e.g., "transactions")</span>
                    </li>
                    <li className="flex flex-col gap-1">
                        <span className="text-slate-200 font-medium">operation</span>
                        <span className="text-xs">Function ("sum", "count", "avg")</span>
                    </li>
                    <li className="flex flex-col gap-1">
                        <span className="text-slate-200 font-medium">column</span>
                        <span className="text-xs">Column to aggregate (e.g., "total_price")</span>
                    </li>
                    </ul>
                </section>

                <section>
                    <h4 className="font-medium text-base text-white mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Supported Data
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h5 className="font-semibold text-xs uppercase text-slate-500 mb-2">Tables</h5>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside marker:text-slate-600">
                        <li>transactions</li>
                        <li>expenses</li>
                        <li>items</li>
                        <li>customers</li>
                        <li>stock_flow</li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold text-xs uppercase text-slate-500 mb-2">Operations</h5>
                        <ul className="space-y-1 text-slate-300 list-disc list-inside marker:text-slate-600">
                        <li>sum</li>
                        <li>count</li>
                        <li>avg</li>
                        <li>min</li>
                        <li>max</li>
                        </ul>
                    </div>
                    </div>
                </section>
              </div>

              <section>
                <h4 className="font-medium text-base text-white mb-4">Common Examples</h4>
                <div className="space-y-3">
                  <div className="group">
                    <p className="font-medium text-xs text-slate-500 mb-1 group-hover:text-cyan-400 transition-colors">Total Revenue</p>
                    <code className="block bg-slate-900 border border-slate-800 p-2.5 rounded text-xs font-mono text-slate-300 group-hover:border-cyan-500/30 transition-colors">
                        =DB_DATA("transactions", "sum", "total_price")
                    </code>
                  </div>
                  <div className="group">
                    <p className="font-medium text-xs text-slate-500 mb-1 group-hover:text-cyan-400 transition-colors">Marketing Expenses</p>
                    <code className="block bg-slate-900 border border-slate-800 p-2.5 rounded text-xs font-mono text-slate-300 group-hover:border-cyan-500/30 transition-colors">
                        =DB_DATA("expenses", "sum", "amount", '&#123;"category": "Marketing"&#125;')
                    </code>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900/30 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
