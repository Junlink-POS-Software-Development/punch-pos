import React, { useEffect } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Loader2, Lock, CalendarClock, AlertCircle } from "lucide-react";
import { ExpenseInput } from "../../lib/expenses.api";
import { ClassificationSelect } from "../../utils/ClassificationSelect";

import dayjs from "dayjs";
import { useStaffPermissions } from "@/app/settings/backdating/stores/useStaffPermissions";
import { useTransactionStore } from "@/app/settings/backdating/stores/useTransactionStore";

export interface CategoryItem {
  id: string | number;
  category: string;
}

export interface CashoutRefs {
  amount: React.RefObject<HTMLInputElement | null>;
  classification: React.RefObject<HTMLElement | null>;
  source: React.RefObject<HTMLSelectElement | null>;
  receipt: React.RefObject<HTMLInputElement | null>;
  notes: React.RefObject<HTMLTextAreaElement | null>;
  date: React.RefObject<HTMLInputElement | null>;
  submitBtn: React.RefObject<HTMLButtonElement | null>;
}

interface CashoutFormProps {
  form: UseFormReturn<ExpenseInput>;
  refs: CashoutRefs;
  categories: CategoryItem[];
  isSubmitting: boolean;
  isCategoriesLoading: boolean;
  handlers: {
    onSubmit: (data: ExpenseInput) => Promise<void>;
    handleKeyDown: (
      e: React.KeyboardEvent,
      nextRef: React.RefObject<HTMLElement | null>
    ) => void;
    setRef: (key: keyof CashoutRefs, node: HTMLElement | null) => void;
  };
  isWide?: boolean;
}

export const CashoutForm = ({
  form,
  refs,
  categories,
  isSubmitting,
  isCategoriesLoading,
  handlers,
  isWide = false,
}: CashoutFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = form;

  // [NEW] 1. Get Permission and Store Data
  const { canBackdate, isLoading: isPermsLoading } = useStaffPermissions();
  const { customTransactionDate } = useTransactionStore();

  const { onSubmit, handleKeyDown, setRef } = handlers;

  // [NEW] 2. Intelligent Date Handling
  useEffect(() => {
    // Wait for permissions to load
    if (isPermsLoading) return;

    const today = dayjs().format("YYYY-MM-DD");

    if (!canBackdate) {
      // CASE A: No Permission -> Force Date to Today
      setValue("transaction_date", today);
    } else {
      // CASE B: Has Permission -> Check if Global Session is active
      if (customTransactionDate) {
        // Auto-fill from the global "Backdating Session"
        setValue(
          "transaction_date",
          dayjs(customTransactionDate).format("YYYY-MM-DD")
        );
      }
      // Else: Leave it blank or whatever user types (User has freedom)
    }
  }, [canBackdate, customTransactionDate, isPermsLoading, setValue]);

  const { ref: amountHookRef, ...amountRest } = register("amount", {
    required: true,
    min: 0,
    valueAsNumber: true,
  });
  const { ref: sourceHookRef, ...sourceRest } = register("source", {
    required: true,
  });
  const { ref: receiptHookRef, ...receiptRest } = register("receipt_no");
  const { ref: notesHookRef, ...notesRest } = register("notes");
  const { ref: dateHookRef, ...dateRest } = register("transaction_date", {
    required: true,
  });

  return (
    <div className="relative p-6 h-full glass-effect">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-white text-xl">
          Register New Expense
        </h2>

        {/* [NEW] Session Indicator Badge */}
        {canBackdate && customTransactionDate && (
          <div className="flex items-center gap-2 bg-amber-950/40 px-3 py-1.5 border border-amber-500/20 rounded-full text-amber-400 text-xs animate-pulse">
            <CalendarClock className="w-3 h-3" />
            <span className="font-bold uppercase tracking-wide">
              Backdating Active
            </span>
          </div>
        )}
      </div>

      <form
        className={`gap-x-6 gap-y-2 grid grid-cols-1 md:grid-cols-2 ${
          isWide ? "xl:grid-cols-2" : "xl:grid-cols-3"
        }`}
      >
        {/* 1. Amount */}
        <div className="relative pb-5">
          <label className="block mb-2 font-medium text-slate-300 text-sm">
            Amount (₱)
          </label>
          <input
            type="number"
            step="0.01"
            {...amountRest}
            ref={(e) => {
              amountHookRef(e);
              setRef("amount", e);
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.classification)}
            className={`w-full input-dark ${
              errors.amount ? "border-red-500 text-red-200" : ""
            }`}
            placeholder="0.00"
            autoFocus
          />
          {errors.amount && (
            <p className="bottom-0 absolute text-red-400 text-xs">
              Amount is required
            </p>
          )}
        </div>

        {/* 2. Classification */}
        <div className="relative pb-5">
          <label className="block mb-2 font-medium text-slate-300 text-sm">
            Classification
          </label>
          <Controller
            name="classification"
            control={control}
            rules={{ required: "Classification is required" }}
            render={({ field }) => (
              <ClassificationSelect
                {...field}
                ref={(e: HTMLElement | null) => {
                  field.ref(e);
                  setRef("classification", e);
                }}
                onKeyDown={(e: React.KeyboardEvent) =>
                  handleKeyDown(e, refs.source)
                }
                error={errors.classification?.message}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.classification && (
            <p className="bottom-0 absolute text-red-400 text-xs">
              {errors.classification.message}
            </p>
          )}
        </div>

        {/* 3. Source */}
        <div className="relative pb-5">
          <label className="block mb-2 font-medium text-slate-300 text-sm">
            Source (Category)
          </label>
          <select
            {...sourceRest}
            ref={(e) => {
              sourceHookRef(e);
              setRef("source", e);
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.receipt)}
            className={`w-full input-dark ${
              errors.source ? "border-red-500" : ""
            }`}
            disabled={isCategoriesLoading}
          >
            <option value="">
              {isCategoriesLoading ? "Loading..." : "Select Source"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
          {errors.source && (
            <p className="bottom-0 absolute text-red-400 text-xs">
              Source is required
            </p>
          )}
        </div>

        {/* 4. Receipt No */}
        <div className="relative pb-5">
          <label className="block mb-2 font-medium text-slate-300 text-sm">
            Receipt No.
          </label>
          <input
            type="text"
            {...receiptRest}
            ref={(e) => {
              receiptHookRef(e);
              setRef("receipt", e);
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.notes)}
            className="w-full input-dark"
            placeholder="Optional"
          />
        </div>

        {/* 5. Date (Logic Applied Here) */}
        <div className="relative pb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-medium text-slate-300 text-sm">
              Date
            </label>
            {/* Show Lock Icon if No Permission */}
            {!canBackdate && !isPermsLoading && (
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Locked</span>
              </div>
            )}
          </div>

          <input
            type="date"
            {...dateRest}
            ref={(e) => {
              dateHookRef(e);
              setRef("date", e);
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.submitBtn)}
            // [NEW] Logic: Disable if user cannot backdate
            disabled={!canBackdate}
            className={`w-full input-dark ${
              errors.transaction_date ? "border-red-500" : ""
            } ${
              !canBackdate
                ? "opacity-50 cursor-not-allowed bg-slate-900/50 text-slate-500"
                : "cursor-pointer focus:ring-cyan-500"
            }`}
          />
          {errors.transaction_date && (
            <p className="bottom-0 absolute text-red-400 text-xs">
              Date is required
            </p>
          )}
        </div>

        {/* 6. Notes */}
        <div
          className={`relative pb-5 md:col-span-2 ${
            isWide ? "xl:col-span-2" : "xl:col-span-1"
          }`}
        >
          <label className="block mb-2 font-medium text-slate-300 text-sm">
            Notes
          </label>
          <textarea
            {...notesRest}
            ref={(e) => {
              notesHookRef(e);
              setRef("notes", e);
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.date)}
            className="w-full h-[42px] md:h-20 resize-none input-dark"
            placeholder="Additional details..."
          />
        </div>

        {/* Submit Button */}
        <div
          className={`flex justify-end pt-2 md:col-span-2 ${
            isWide ? "xl:col-span-2" : "xl:col-span-3"
          }`}
        >
          <button
            type="button"
            ref={(e) => setRef("submitBtn", e)}
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex items-center gap-2 disabled:opacity-50 px-8 h-12 btn-3d-glass"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : "Submit Expense (Shift+Enter)"}
          </button>
        </div>
      </form>
    </div>
  );
};
