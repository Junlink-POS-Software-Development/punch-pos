import React from "react";
import { useInventoryInfinite } from "../../../../dashboard/hooks/useInventory";
import { useStocksLogic } from "../hooks/useStocksLogic";
import { getStocksColumns } from "./Columns";
import { StocksHeader } from "./StocksHeader";
import { StocksDataGrid } from "./StocksDataGrid";

export function StocksMonitorContent() {
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

  // Handle Scroll to Load More
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
  };

  const columns = getStocksColumns({
    inventory: inventory || [], // Pass current rows for context if needed
    filters,
    sortState,
    onApplyFilter: handleApplyFilter,
    onSort: handleSort,
  });

  return (
    <div className="flex flex-col gap-4">
      <StocksHeader
        totalCount={totalCount}
        currentCount={inventory.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <StocksDataGrid
        inventory={inventory}
        columns={columns}
        isFetchingNextPage={isFetchingNextPage}
        onScroll={handleScroll}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
