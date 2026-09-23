import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 min-h-[50vh] space-y-4 animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <Loader2 className="w-5 h-5 text-primary absolute animate-spin" />
      </div>
      <div className="flex flex-col items-center space-y-1">
        <p className="text-sm font-semibold text-foreground tracking-tight">
          Loading view...
        </p>
        <p className="text-xs text-muted-foreground animate-pulse">
          Please wait a moment
        </p>
      </div>
    </div>
  );
}
