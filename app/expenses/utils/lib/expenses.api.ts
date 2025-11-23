// lib/expenses.api.ts
import { supabase } from "../../../../lib/supabaseClient";

export interface ExpenseData {
  id: string;
  transaction_date: string;
  source: string;
  classification: string;
  amount: number;
  receipt_no: string;
  notes: string;
}

export type ExpenseInput = Omit<ExpenseData, "id">;

// 1. Fetch Expenses
export const fetchExpenses = async (): Promise<ExpenseData[]> => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// 2. Create Expense
export const createExpense = async (input: ExpenseInput) => {
  // A. Get Current User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // B. Get User's Store and Admin ID from 'members' table
  const { data: memberData, error: memberError } = await supabase
    .from("members")
    .select("store_id, admin_user_id")
    .eq("user_id", user.id)
    .single();

  if (memberError || !memberData) throw new Error("Member profile not found");

  // C. Insert Record
  const { error } = await supabase.from("expenses").insert({
    transaction_date: input.transaction_date,
    source: input.source,
    classification: input.classification,
    amount: input.amount,
    receipt_no: input.receipt_no,
    notes: input.notes,
    user_id: user.id,
    store_id: memberData.store_id,
    admin_user_id: memberData.admin_user_id,
  });

  if (error) throw new Error(error.message);
};
