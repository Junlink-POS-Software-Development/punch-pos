"use client";

import { useState, useCallback } from "react";
import { CashoutTable } from "./CashoutTable";
import { CashoutModal } from "./CashoutModal";
import { useCashout } from "../../hooks/useCashout";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";
import { useExpenses } from "../../hooks/useExpenses";

export function Cashout() {
  const getLocalDate = useCallback(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  }, []);

  // Default to today
  const [dateRange, setDateRange] = useState({
    start: getLocalDate(),
    end: getLocalDate(),
  });

  const { form, refs, data: hookData, handlers } = useCashout();

  // Fetch data based on the date range
  const { expenses: filteredExpenses, isLoading: isFilteredLoading, removeExpense } =
    useExpenses(dateRange.start || dateRange.end ? dateRange : undefined);

  const { viewState } = useViewStore();
  const isRightFullscreen = viewState === 2;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateChange = useCallback((start: string, end: string) => {
    setDateRange({ start, end });
  }, []);

  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="flex flex-col gap-4 w-full">
        <CashoutTable
          expenses={filteredExpenses}
          isLoading={isFilteredLoading}
          dateRange={dateRange}
          onDateChange={handleDateChange}
          onAdd={toggleModal}
          isAdding={isModalOpen}
          onDelete={removeExpense}
        />
      </div>

      <CashoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        refs={refs}
        categories={hookData.categories}
        isSubmitting={hookData.isSubmitting}
        isCategoriesLoading={hookData.isCategoriesLoading}
        handlers={handlers}
      />
    </div>
  );
}