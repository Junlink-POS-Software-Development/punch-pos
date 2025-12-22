import React from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { ExpenseInput } from "../../lib/expenses.api";
import { ClassificationSelect } from "../ClassificationSelect";

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
  isWide?: boolean; // <--- Add this line
}

export const CashoutForm = ({
  form,
  refs,
  categories,
  isSubmitting,
  isCategoriesLoading,
  handlers,
  isWide = false, // <--- Add this line
}: CashoutFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const { onSubmit, handleKeyDown, setRef } = handlers;

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
      <h2 className="mb-4 font-semibold text-white text-xl">
        Register New Expense
      </h2>
      <form
        className={`gap-x-6 gap-y-2 grid grid-cols-1 md:grid-cols-2 ${
          // Switch between 2-column grid (fullscreen/split) and 3-column grid (standard)
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

        {/* 5. Date */}
        <div className="relative pb-5">
          <label className="block mb-2 font-medium text-slate-300 text-sm">
            Date
          </label>
          <input
            type="date"
            {...dateRest}
            ref={(e) => {
              dateHookRef(e);
              setRef("date", e);
            }}
            onKeyDown={(e) => handleKeyDown(e, refs.submitBtn)}
            className={`w-full input-dark ${
              errors.transaction_date ? "border-red-500" : ""
            }`}
          />
          {errors.transaction_date && (
            <p className="bottom-0 absolute text-red-400 text-xs">
              Date is required
            </p>
          )}
        </div>

        {/* 6. Notes - Always takes full width in 2-column layout */}
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
