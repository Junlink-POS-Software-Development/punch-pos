"use client";

import React, { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useExpenses } from "../hooks/useExpenses";
import { ExpenseInput } from "../lib/expenses.api";
import { fetchFlowCategories } from "../lib/cashflow.api";
import { useQuery } from "@tanstack/react-query"; // ✅ FIXED: added missing source
import { ClassificationSelect } from "./ClassificationSelect";

// Helper to get local date string (YYYY-MM-DD) correctly
const getLocalDate = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

export function Cashout() {
  const { expenses, addExpense, isLoading, isSubmitting } = useExpenses();

const amountRef = useRef<HTMLElement | null>(null);
const classificationRef = useRef<HTMLElement | null>(null);
const sourceRef = useRef<HTMLElement | null>(null);
const receiptRef = useRef<HTMLElement | null>(null);
const notesRef = useRef<HTMLElement | null>(null);
const dateRef = useRef<HTMLElement | null>(null);
const submitButtonRef = useRef<HTMLButtonElement | null>(null);


  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExpenseInput>({
    defaultValues: {
      transaction_date: getLocalDate(),
    },
  });

  // --- Queries ---
  const { data: categories = [] } = useQuery({
    queryKey: ["flow-categories"],
    queryFn: fetchFlowCategories,
  });

  // --- Handlers ---
  const onSubmit = async (data: ExpenseInput) => {
    try {
      await addExpense(data);
      reset({
        transaction_date: getLocalDate(),
        amount: 0,
        classification: "",
        source: "",
        receipt_no: "",
        notes: ""
      });
      alert("Expense registered successfully!");
      // Reset focus to top
      setTimeout(() => amountRef.current?.focus(), 100);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // --- Navigation Logic ---
function handleKeyDown(
  e: React.KeyboardEvent,
  nextRef: React.RefObject<HTMLElement | null>
) {
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    // ✅ trigger form submission
    handleSubmit(onSubmit)();
    return;
  }

  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    nextRef.current?.focus();
  }
}



  // Combining React Hook Form refs with local refs
  const { ref: amountHookRef, ...amountRest } = register("amount", { required: true, min: 0, valueAsNumber: true });
  const { ref: sourceHookRef, ...sourceRest } = register("source", { required: true });
  const { ref: receiptHookRef, ...receiptRest } = register("receipt_no");
  const { ref: notesHookRef, ...notesRest } = register("notes");
  const { ref: dateHookRef, ...dateRest } = register("transaction_date", { required: true });

  return (
    <div className="flex flex-col gap-8">
      {/* Form Section */}
      <div className="p-6 glass-effect relative">
        <h2 className="mb-4 font-semibold text-white text-xl">Register New Expense</h2>
        
        {/* We remove onSubmit from form tag to prevent default HTML submission on Enter */}
        <form className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          
          {/* 1. Amount */}
          <div className="relative pb-5">
            <label className="block mb-2 font-medium text-slate-300 text-sm">Amount (₱)</label>
            <input 
              type="number" 
              step="0.01"
              {...amountRest}
              ref={(e) => {
                amountHookRef(e);
                amountRef.current = e;
              }}
              onKeyDown={(e) => handleKeyDown(e, classificationRef)}
              className={`w-full input-dark ${errors.amount ? "border-red-500" : ""}`}
              placeholder="0.00"
              autoFocus
            />
            {errors.amount && <p className="bottom-0 absolute text-red-300 text-sm">Amount is required</p>}
          </div>

          {/* 2. Classification */}
          <div className="relative pb-5">
            <label className="block mb-2 font-medium text-slate-300 text-sm">Classification</label>
            <Controller
              name="classification"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <ClassificationSelect
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    classificationRef.current = e;
                  }}
                  onKeyDown={(e) => handleKeyDown(e, sourceRef)}
                  error={errors.classification?.message}
                  disabled={isSubmitting}
                />
              )}
            />
            {errors.classification && <p className="bottom-0 absolute text-red-300 text-sm">Classification is required</p>}
          </div>

          {/* 3. Source */}
          <div className="relative pb-5">
            <label className="block mb-2 font-medium text-slate-300 text-sm">Source (Category)</label>
            <select 
              {...sourceRest}
              ref={(e) => {
                sourceHookRef(e);
                sourceRef.current = e;
              }}
              onKeyDown={(e) => handleKeyDown(e, receiptRef)}
              className={`w-full input-dark ${errors.source ? "border-red-500" : ""}`}
            >
              <option value="">Select Source</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.source && <p className="bottom-0 absolute text-red-300 text-sm">Source is required</p>}
          </div>

          {/* 4. Receipt No */}
          <div className="relative pb-5">
            <label className="block mb-2 font-medium text-slate-300 text-sm">Receipt No.</label>
            <input 
              type="text" 
              {...receiptRest}
              ref={(e) => {
                receiptHookRef(e);
                receiptRef.current = e;
              }}
              onKeyDown={(e) => handleKeyDown(e, notesRef)}
              className="w-full input-dark" 
              placeholder="Optional"
            />
          </div>

          {/* 5. Notes (Textarea) */}
          <div className="md:col-span-2 lg:col-span-2 relative pb-5">
            <label className="block mb-2 font-medium text-slate-300 text-sm">Notes</label>
            <textarea 
              {...notesRest}
              ref={(e) => {
                notesHookRef(e);
                notesRef.current = e;
              }}
              onKeyDown={(e) => handleKeyDown(e, dateRef)}
              className="w-full input-dark h-20 resize-none" 
              placeholder="Additional details..."
            />
          </div>

          {/* 6. Date */}
          <div className="relative pb-5">
            <label className="block mb-2 font-medium text-slate-300 text-sm">Date</label>
            <input 
              type="date" 
              {...dateRest}
              ref={(e) => {
                dateHookRef(e);
                dateRef.current = e;
              }}
              onKeyDown={(e) => handleKeyDown(e, submitButtonRef)}
              className={`w-full input-dark ${errors.transaction_date ? "border-red-500" : ""}`}
            />
            {errors.transaction_date && <p className="bottom-0 absolute text-red-300 text-sm">Date is required</p>}
          </div>
          
          <div className="flex justify-end lg:col-span-3">
            <button 
              type="button" // Important: type="button" so it doesn't auto-submit on random Enters elsewhere
              ref={submitButtonRef}
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting} 
              className="flex items-center gap-2 disabled:opacity-50 px-8 btn-3d-glass"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Expense (Shift+Enter)"}
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="p-6 glass-effect">
        <h3 className="mb-4 font-semibold text-white text-lg">Recent Cashouts</h3>
        {isLoading ? (
          <div className="py-8 text-slate-400 text-center">Loading records...</div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-slate-300 text-sm text-left">
              <thead className="top-0 sticky bg-black/50 backdrop-blur-md">
                 <tr className="border-slate-700 border-b">
                   <th className="py-3">Date</th>
                   <th className="py-3">Source</th>
                   <th className="py-3">Classification</th>
                   <th className="py-3">Receipt</th>
                   <th className="py-3 text-right">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3">{row.transaction_date}</td>
                    <td className="py-3">{row.source}</td>
                    <td className="py-3">{row.classification}</td>
                    <td className="py-3">{row.receipt_no || "-"}</td>
                    <td className="py-3 text-red-400 text-right">-₱{Number(row.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}