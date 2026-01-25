import React from "react";
import { User, Calendar, Star } from "lucide-react";

export const CustomerIntelligence = () => {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between shrink-0 h-6">
        <label className="text-xs text-slate-400 font-bold flex items-center gap-1">
          <User className="w-3 h-3" />
          Customer Intelligence
        </label>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Active
        </span>
      </div>
      
      <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-300 border border-slate-800 space-y-2">
         <div className="flex items-center justify-between">
            <span className="text-slate-500">Loyalty Points</span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
               <Star className="w-3 h-3 fill-amber-400" />
               150 pts
            </div>
         </div>
         
         <div className="space-y-1">
            <span className="text-slate-500 block">Last Purchase</span>
            <p className="font-medium text-white truncate">Stardew Valley Plushie</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
               <Calendar className="w-3 h-3" />
               2 days ago
            </div>
         </div>
      </div>
    </div>
  );
};
