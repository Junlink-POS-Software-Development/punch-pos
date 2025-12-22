"use client";

import { CashoutForm } from "./CashoutForm";
import { CashoutTable } from "./CashoutTable";
import { useCashout } from "../../hooks/useCashout";
import { useViewStore } from "@/components/window-layouts/store/useViewStore";

export function Cashout() {
  const { form, refs, data, handlers } = useCashout();
  const { viewState } = useViewStore();

  // viewState 2 is the right-side fullscreen mode
  const isRightFullscreen = viewState === 2;

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
          categories={data.categories}
          isSubmitting={data.isSubmitting}
          isCategoriesLoading={data.isCategoriesLoading}
          handlers={handlers}
          // Pass this down so the form can adjust its internal layout
          isWide={isRightFullscreen}
        />
      </div>

      <div className="w-full">
        <CashoutTable expenses={data.expenses} isLoading={data.isLoading} />
      </div>
    </div>
  );
}
