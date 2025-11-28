"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useExpenseContext } from "../context/ExpenseContext"; // New Import
import { ExpenseInput } from "../lib/expenses.api"; // Adjust path

export function Cashout() {
  // Use Context
  const { expenses, addExpense, isLoading, isSubmitting } = useExpenseContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseInput>({
    defaultValues: {
      transaction_date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit: SubmitHandler<ExpenseInput> = async (data) => {
    try {
      await addExpense(data);
      reset();
      alert("Expense registered successfully!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Form Section */}
      <div className="p-6 glass-effect">
        <h2 className="mb-4 font-semibold text-white text-xl">Register New Expense</h2>
        <form className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
          {/* ... Input Fields (Same as before) ... */}
           <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">Date</label>
            <input type="date" {...register("transaction_date", { required: true })} className="w-full input-dark" />
          </div>
          {/* ... Add other inputs here ... */}
          
          <div className="flex justify-end lg:col-span-3">
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 disabled:opacity-50 px-8 btn-3d-glass">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Expense"}
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
              {/* ... Table Header ... */}
              <thead className="top-0 sticky bg-black/50 backdrop-blur-md">
                 <tr className="border-slate-700 border-b">
                   <th className="py-3">Date</th>
                   <th className="py-3">Source</th>
                   <th className="py-3 text-right">Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3">{row.transaction_date}</td>
                    <td className="py-3">{row.source}</td>
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