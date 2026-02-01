"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SummaryStats } from '../lib/types';
import { FormulaGuide } from './FormulaGuide';
import { savePlaygroundState, updatePlaygroundState } from '../lib/repository';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import "@fortune-sheet/react/dist/index.css";

// Dynamic import for FortuneSheet to avoid SSR issues
const Workbook = dynamic(
  () => import("@fortune-sheet/react").then((mod) => mod.Workbook),
  { ssr: false }
);

interface SpreadsheetProps {
  initialStats?: SummaryStats;
  storeId: string;
}

export default function Spreadsheet({ initialStats, storeId }: SpreadsheetProps) {
  const [loading, setLoading] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [data, setData] = useState<any>([{ name: "Sheet1", status: 1, celldata: [] }]); // Default sheet
  
  const handleSave = async () => {
    setLoading(true);
    try {
      // @ts-ignore - Luckysheet global might not be typed
      const sheetData = window.luckysheet ? window.luckysheet.getAllSheets() : data;
      
      if (currentId) {
        await updatePlaygroundState(currentId, sheetData);
      } else {
        const name = prompt("Enter name for this playground:", "New Playground");
        if (!name) {
            setLoading(false);
            return;
        }
        const saved = await savePlaygroundState({ store_id: storeId, name, content: sheetData });
        // @ts-ignore
        setCurrentId(saved.id);
      }
      alert("Saved successfully!");
    } catch (e: any) {
      alert("Error saving: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = () => {
     window.location.reload(); // Simple sync: reload page to fetch fresh stats
  };

  return (
    <div className="flex flex-col h-full w-full font-lexend bg-[#0B1120]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0B1120] sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <h2 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Playground
            </h2>
            <div className="h-6 w-px bg-slate-800 mx-2 hidden sm:block"></div>
            <FormulaGuide />
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={handleSync}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-400 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all duration-200"
            >
                <RefreshCw size={14} />
                <span className="hidden sm:inline">Sync Data</span>
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />}
                {currentId ? "Save Change" : "Save Model"}
            </button>
        </div>
      </div>
      
      {/* Container for the sheet */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-100">
         {/* Note: FortuneSheet usually renders a light grid. 
             If we want dark mode for the grid itself, we'd need to pass specific config to Workbook 
             or rely on its internal theme settings if available. 
             For now, we keep the container dark but the sheet light/neutral for readability, 
             or wrapping it nicely. 
         */}
         {/* @ts-ignore */}
         <Workbook 
            data={data} 
            onChange={(d: any) => setData(d)}
         />
      </div>
    </div>
  );
}
