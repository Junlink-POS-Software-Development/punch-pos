"use client";

import { useState, useCallback } from "react";
import { CashoutTable } from "./cashout-table";
import { CashoutModal } from "./CashoutModal";
import { useCashout } from "../../hooks/useCashout";
import { useExpensesInfinite } from "../../hooks/useExpenses";

export function Cashout() {
  // Default to no filter (show all data, user can filter if needed)
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const { form, refs, data: hookData, handlers } = useCashout();

  // Fetch data with infinite scroll - date range is optional filter
  const {
    expenses,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    totalRecords,
    removeExpense,
    editExpense,
  } = useExpensesInfinite(
    30,
    dateRange.start || dateRange.end ? dateRange : undefined
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDateChange = useCallback((start: string, end: string) => {
    setDateRange({ start, end });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="flex flex-col gap-4 w-full">
        <CashoutTable
          expenses={expenses}
          isLoading={isLoading}
          dateRange={dateRange}
          onDateChange={handleDateChange}
          onAdd={() => {
            setIsModalOpen(true);
          }}
          isAdding={isModalOpen}
          // Inline Editing Props
          categories={hookData.categories}
          onUpdate={editExpense}
          onDelete={removeExpense}
          // Infinite scroll props
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          totalRecords={totalRecords}
        />
      </div>

      <CashoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Expense"
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