import React from "react";
import { User, Calendar, Star } from "lucide-react";

export const CustomerIntelligence = () => {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between shrink-0 h-6">
        <label className="text-xs text-muted-foreground font-bold flex items-center gap-1">
          <User className="w-3 h-3" />
          Customer Intelligence
        </label>
        <span className="text-[10px] text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
          Active
        </span>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground border border-border space-y-2">
         <div className="flex items-center justify-between">
            <span className="text-muted-foreground/70">Loyalty Points</span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
               <Star className="w-3 h-3 fill-amber-500" />
               150 pts
            </div>
         </div>
         
         <div className="space-y-1">
            <span className="text-muted-foreground/70 block">Last Purchase</span>
            <p className="font-medium text-foreground truncate">Stardew Valley Plushie</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
               <Calendar className="w-3 h-3" />
               2 days ago
            </div>
         </div>
      </div>
    </div>
  );
};
