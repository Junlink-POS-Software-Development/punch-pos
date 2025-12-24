"use server";

import { createClient } from "@/utils/supabase/server";

const getSupabase = async () => {
  return await createClient();
};

// --- TYPES ---

// Return type for the Breakdown UI
export type ExpenseBreakdownItem = {
  classification: string;
  amount: number;
  source_name: string;
};

// Strict type for the raw DB response in the breakdown query
interface ExpenseBreakdownRow {
  amount: number;
  classification: string | null;
  product_category: {
    category: string;
  } | null;
}

// Types for General Expense Management
interface ExpenseRowDB {
  id: string;
  transaction_date: string;
  source: string | null;
  classification: string | null;
  amount: number;
  receipt_no: string | null;
  notes: string | null;
  created_at: string;
  product_category: {
    category: string;
  } | null;
}

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

export interface Classification {
  id: string;
  name: string;
  store_id: string;
}

// --- API METHODS ---

// 1. Fetch Expenses Breakdown (Integrated & Typed)
export const fetchExpensesBreakdown = async (
  startDate: string,
  endDate: string
) => {
  const supabase = await getSupabase();

  // Fetch expenses with their associated source (product_category)
  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
      amount,
      classification,
      product_category!inner (
        category
      )
    `
    )
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .not("classification", "is", null)
    .returns<ExpenseBreakdownRow[]>(); // <--- Strictly typed response

  if (error) {
    console.error("Error fetching expense breakdown:", error);
    throw error;
  }

  // Aggregate the data: Group by Source -> Classification
  const aggregated: Record<string, Record<string, number>> = {};

  data?.forEach((item) => {
    // No "any" needed here anymore; item is ExpenseBreakdownRow
    const source = item.product_category?.category || "Uncategorized";
    const classification = item.classification || "Other";
    const amount = Number(item.amount);

    if (!aggregated[source]) {
      aggregated[source] = {};
    }

    if (!aggregated[source][classification]) {
      aggregated[source][classification] = 0;
    }

    aggregated[source][classification] += amount;
  });

  return aggregated;
};

// 2. Fetch All Expenses (List View)
export const fetchExpenses = async (
  startDate?: string,
  endDate?: string
): Promise<ExpenseData[]> => {
  const supabase = await getSupabase();

  let query = supabase
    .from("expenses")
    .select(
      `
      *,
      product_category (
        category
      )
    `
    )
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (startDate) {
    query = query.gte("transaction_date", startDate);
  }
  if (endDate) {
    query = query.lte("transaction_date", endDate);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data || []).map(
    (row: ExpenseRowDB): ExpenseData => ({
      id: row.id,
      transaction_date: row.transaction_date,
      classification: row.classification ?? "",
      amount: row.amount,
      receipt_no: row.receipt_no ?? "",
      notes: row.notes ?? "",
      source: row.product_category?.category || row.source || "Unknown",
    })
  );
};

// 3. Create Expense (RPC)
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

// 4. Fetch Classifications
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

// 5. Create Classification (RPC)
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

// 6. Update Classification
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

// 7. Delete Classification
export const deleteClassification = async (id: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase.from("classification").delete().eq("id", id);

  if (error) {
    console.error("Error deleting classification:", error);
    throw new Error(error.message);
  }
};
