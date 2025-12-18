"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, X } from "lucide-react";
import dayjs from "dayjs";
import { fetchCashFlowByRange } from "../lib/dashboard.api"; // Import updated API

const MonthlyGrossCard = () => {
  const [startDate, setStartDate] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().endOf("month").format("YYYY-MM-DD"));
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalGross, setTotalGross] = useState(0);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // The API now returns the calculated sum directly
        const grossAmount = await fetchCashFlowByRange(startDate, endDate);
        setTotalGross(Number(grossAmount)); // Ensure it's treated as a number
      } catch (error) {
        console.error("Failed to fetch monthly gross", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return (
    <div className="bg-slate-800 shadow-lg p-6 rounded-xl text-white relative">
      <div className="flex justify-between items-start mb-4">
        <h2 className="font-bold text-xl">Monthly Income Gross</h2>
        
        <div className="relative" ref={datePickerRef}>
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Select Date Range"
          >
            <Calendar className="w-5 h-5 text-slate-300" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-slate-300">Select Range</span>
                <button onClick={() => setShowDatePicker(false)}>
                  <X className="w-4 h-4 text-slate-500 hover:text-white" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
          <span>Range:</span>
          <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-200">
            {dayjs(startDate).format("MMM D")} - {dayjs(endDate).format("MMM D, YYYY")}
          </span>
        </div>

        {loading ? (
          <div className="h-10 w-32 bg-slate-700 animate-pulse rounded mt-2"></div>
        ) : (
          <p className="font-bold text-3xl text-emerald-400">
            ₱{totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
      </div>
      <p className="text-slate-500 text-xs italic mt-4">
        Sum of all cash-in categories for selected range.
      </p>
    </div>
  );
};

export default MonthlyGrossCard;