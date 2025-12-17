"use server";

import { createClient } from "@/utils/supabase/server";

const getSupabase = async () => {
  return await createClient();
};

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

export interface Classification {
  id: string;
  name: string;
  store_id: string;
}

// 1. Fetch Expenses
export const fetchExpenses = async (): Promise<ExpenseData[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// 2. Create Expense (RPC VERSION)
export const createExpense = async (input: ExpenseInput) => {
  const supabase = await getSupabase();
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

// --- CLASSIFICATION API ---

// 3. Fetch Classifications
export const fetchClassifications = async (): Promise<Classification[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("classification")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching classifications:", error);
    return [];
  }
  return data || [];
};

// 4. Create Classification (RPC)
export const createClassification = async (name: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase.rpc("insert_new_classification", {
    name_in: name,
  });

  if (error) {
    console.error("Error creating classification:", error);
    throw new Error(error.message);
  }
};

// 5. Update Classification
export const updateClassification = async (id: string, name: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("classification")
    .update({ name })
    .eq("id", id);

  if (error) {
    console.error("Error updating classification:", error);
    throw new Error(error.message);
  }
};

// 6. Delete Classification
export const deleteClassification = async (id: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("classification")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting classification:", error);
    throw new Error(error.message);
  }
};
