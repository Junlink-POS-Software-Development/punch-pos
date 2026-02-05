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
    <div className="flex justify-between items-end py-4 border-b border-border">
      <div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="bg-background border border-input rounded-lg pl-9 pr-4 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-input transition-all w-64 shadow-sm"
          />
        </div>
      </div>
      <div className="bg-muted px-4 py-2 border border-border rounded font-mono text-xs text-muted-foreground">
        Showing <span className="text-primary font-bold">{currentCount}</span> of{" "}
        <span className="text-foreground">{totalCount}</span> items
      </div>
    </div>
  );
}
