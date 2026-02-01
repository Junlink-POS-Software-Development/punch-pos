import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface StocksHeaderProps {
  totalCount: number;
  currentCount: number;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export function StocksHeader({
  totalCount,
  currentCount,
  searchTerm,
  onSearchChange,
}: StocksHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, onSearchChange]);

  // Sync if parent updates (optional, for reset scenarios)
  useEffect(() => {
    if (searchTerm !== localSearch) {
       // Only sync if the difference is significant or forced externally
       // For simple typing, we don't want to fight the local state.
       // Only if searchTerm is empty (reset) and local is not
       if (searchTerm === "" && localSearch !== "") {
         setLocalSearch("");
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="flex justify-between items-end py-4 border-slate-700">
      <div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="bg-slate-950/50 border border-slate-700/50 rounded-lg pl-9 pr-4 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all w-64 shadow-inner"
          />
        </div>
      </div>
      <div className="bg-slate-800/50 px-4 py-2 border border-slate-700 rounded font-mono text-xs">
        Showing <span className="text-blue-400">{currentCount}</span> of{" "}
        <span className="text-slate-400">{totalCount}</span> items
      </div>
    </div>
  );
}
