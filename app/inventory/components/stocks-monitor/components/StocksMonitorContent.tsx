import React, { useRef, useEffect } from "react";
import { useInventoryInfinite } from "../../../../dashboard/hooks/useInventory";
import { useStocksLogic } from "../hooks/useStocksLogic";
import { StocksHeader } from "./StocksHeader";
import { StocksDataGrid } from "./StocksDataGrid";

interface StocksMonitorContentProps {
  onCollapseChange?: (collapsed: boolean) => void;
  isHeaderCollapsed?: boolean;
}

export function StocksMonitorContent({ onCollapseChange, isHeaderCollapsed }: StocksMonitorContentProps) {
  // Custom hook handles filtering/sorting query params
  const {
    filters,
    sortState,
    handleApplyFilter,
    handleSort,
    searchTerm,
    setSearchTerm,
  } = useStocksLogic();

  // Infinite Query Hook
  const {
    inventory,
    totalCount,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInventoryInfinite({
    filters,
    sort: sortState.col
      ? { col: sortState.col, dir: sortState.dir }
      : undefined,
    search: searchTerm,
  });

  // Handle Scroll to Load More and Collapse Header
  const lastScrollY = useRef(0);
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    
    // Load more when scrolled to bottom (with some buffer)
    if (
      scrollHeight - scrollTop - clientHeight < 50 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }

    // Header collapse tracking
    if (onCollapseChange) {
      const currentScrollY = scrollTop;
      const delta = currentScrollY - lastScrollY.current;

      if (frameId.current) cancelAnimationFrame(frameId.current);

      frameId.current = requestAnimationFrame(() => {
        if (currentScrollY > 100 && delta > 30) {
          if (!isHeaderCollapsed) onCollapseChange(true);
        } else if (currentScrollY < 100 || delta < -30) {
          if (isHeaderCollapsed) onCollapseChange(false);
        }
        lastScrollY.current = currentScrollY;
      });
    }
  };


  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <StocksHeader
        totalCount={totalCount}
        currentCount={inventory.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <StocksDataGrid
        inventory={inventory}
        isFetchingNextPage={isFetchingNextPage}
        onScroll={handleScroll}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
