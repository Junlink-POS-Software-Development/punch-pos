// components/Cashout.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  fetchExpenses,
  ExpenseInput,
} from "../lib/expenses.api";
import { Loader2 } from "lucide-react";

export function Cashout() {
  const queryClient = useQueryClient();

  // 1. Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    defaultValues: {
      transaction_date: new Date().toISOString().split("T")[0], // Today
    },
  });

  // 2. Queries (Fetch Data)
  const { data: expenses, isLoading: isTableLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  // 3. Mutation (Insert Data)
  const mutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] }); // Refresh table
      reset(); // Clear form
      alert("Expense registered successfully!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const onSubmit: SubmitHandler<ExpenseInput> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* --- Form Section --- */}
      <div className="p-6 glass-effect">
        <h2 className="mb-4 font-semibold text-white text-xl">
          Register New Expense
        </h2>
        <form
          className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Date
            </label>
            <input
              type="date"
              {...register("transaction_date", { required: true })}
              className="w-full input-dark"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Source
            </label>
            <input
              type="text"
              placeholder="e.g., Operations Budget"
              {...register("source", { required: true })}
              className="w-full input-dark"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Classification
            </label>
            <input
              type="text"
              placeholder="e.g., Office Supplies"
              {...register("classification")}
              className="w-full input-dark"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { required: true, valueAsNumber: true })}
              className="w-full input-dark"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Receipt No.
            </label>
            <input
              type="text"
              placeholder="e.g., OR-12345"
              {...register("receipt_no")}
              className="w-full input-dark"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Notes
            </label>
            <textarea
              placeholder="Additional details..."
              {...register("notes")}
              className="w-full min-h-20 input-dark"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end lg:col-span-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 disabled:opacity-50 px-8 btn-3d-glass"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {mutation.isPending ? "Submitting..." : "Submit Expense"}
            </button>
          </div>
        </form>
      </div>

      {/* --- Table Section --- */}
      <div className="p-6 glass-effect">
        <h3 className="mb-4 font-semibold text-white text-lg">
          Recent Cashouts
        </h3>

        {isTableLoading ? (
          <div className="py-8 text-slate-400 text-center">
            Loading records...
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-slate-300 text-sm text-left">
              <thead className="top-0 sticky bg-black/50 backdrop-blur-md">
                <tr className="border-slate-700 border-b">
                  <th className="py-3">Date</th>
                  <th className="py-3">Source</th>
                  <th className="py-3">Classification</th>
                  <th className="py-3">Receipt No.</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses?.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3">{row.transaction_date}</td>
                    <td className="py-3">{row.source}</td>
                    <td className="py-3">{row.classification || "-"}</td>
                    <td className="py-3">{row.receipt_no || "-"}</td>
                    <td className="py-3 text-red-400 text-right">
                      -₱{Number(row.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {expenses?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="opacity-50 py-8 text-center">
                      No expenses recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
