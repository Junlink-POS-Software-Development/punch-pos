import { supabase } from "@/lib/supabaseClient";

export interface ExpenseData {
  id: string;
  transaction_date: string; // ISO Date string (YYYY-MM-DD)
  source: string;
  classification: string;
  amount: number;
  receipt_no: string;
  notes: string;
}

export type ExpenseInput = Omit<ExpenseData, "id">;

// 1. Fetch Expenses
// (No change needed, standard select)
export const fetchExpenses = async (): Promise<ExpenseData[]> => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// 2. Create Expense (RPC VERSION)
// This is now much cleaner and safer
export const createExpense = async (input: ExpenseInput) => {
  const { error } = await supabase.rpc("insert_new_expense", {
    transaction_date_in: input.transaction_date,
    source_in: input.source,
    classification_in: input.classification,
    amount_in: input.amount,
    receipt_no_in: input.receipt_no,
    notes_in: input.notes,
  });

  if (error) {
    console.error("RPC Error:", error);
    throw new Error(error.message);
  }
};
