"use client";

import React from "react";
import { X } from "lucide-react";
import { CashoutForm, CashoutRefs, CategoryItem } from "./CashoutForm";
import { ExpenseInput } from "../../lib/expenses.api";
import { UseFormReturn } from "react-hook-form";

interface CashoutModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const CashoutModal: React.FC<CashoutModalProps> = ({
  isOpen,
  onClose,
  form,
  refs,
  categories,
  isSubmitting,
  isCategoriesLoading,
  handlers,
}) => {
  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm animate-in duration-200 fade-in p-4">
      <div className="bg-slate-900 shadow-2xl border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden glass-effect flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-slate-700/50 border-b shrink-0">
          <h2 className="font-semibold text-white text-lg">
            Register New Expense
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <CashoutForm
            form={form}
            refs={refs}
            categories={categories}
            isSubmitting={isSubmitting}
            isCategoriesLoading={isCategoriesLoading}
            handlers={handlers}
            isWide={true}
          />
        </div>
      </div>
    </div>
  );
};
