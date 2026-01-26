"use client";

import { useState } from "react";
import { CashoutForm } from "./CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { useCashout } from "../../hooks/useCashout";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";
import { useExpenses } from "../../hooks/useExpenses";

export function Cashout() {
  const getLocalDate = () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };

  // Default to today
  const [dateRange, setDateRange] = useState({
    start: getLocalDate(),
    end: getLocalDate(),
  });

  const { form, refs, data: hookData, handlers } = useCashout();

  // Fetch data based on the date range
  const { expenses: filteredExpenses, isLoading: isFilteredLoading } =
    useExpenses(dateRange.start || dateRange.end ? dateRange : undefined);

  const { viewState } = useViewStore();
  const isRightFullscreen = viewState === 2;

  const handleDateChange = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  return (
    <div
      className={`grid gap-8 transition-all duration-500 ${
        isRightFullscreen
          ? "grid-cols-1 xl:grid-cols-2 items-start"
          : "grid-cols-1"
      }`}
    >
      <div className="w-full">
        <CashoutForm
          form={form}
          refs={refs}
          categories={hookData.categories}
          isSubmitting={hookData.isSubmitting}
          isCategoriesLoading={hookData.isCategoriesLoading}
          handlers={handlers}
          isWide={isRightFullscreen}
        />
      </div>

      <div className="flex flex-col gap-4 w-full">
        {/* Pass state and handlers directly to the table */}
        <CashoutTable
          expenses={filteredExpenses}
          isLoading={isFilteredLoading}
          dateRange={dateRange}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  );
}