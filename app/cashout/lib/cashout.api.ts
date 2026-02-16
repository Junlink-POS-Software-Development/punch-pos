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
  classification_details: {
    name: string;
  } | null;
  product_category: {
    category: string;
  } | null;
}

// Types for General Expense Management
interface ExpenseRowDB {
  id: string;
  transaction_date: string;
  source: string | null;
  // We now fetch the relation
  classification_details: {
    name: string;
  } | null;
  amount: number;
  receipt_no: string | null;
  notes: string | null;
  created_at: string;
  product_category: {
    category: string;
  } | null;
}

// --- TYPES ---

export type CashoutType = 'COGS' | 'OPEX' | 'REMITTANCE';

export interface CashoutInput {
  transaction_date: string;
  amount: number;
  notes: string;
  store_id?: string;
  classification_id?: string;
  cashout_type: CashoutType;
  metadata?: any;
  receipt_no?: string;
  source?: string;
  manufacturer?: string;
  brand?: string;
  product?: string;
  specs?: string;
  subType?: string;
  subTypeLabel?: string;
  referenceNo?: string;
  expenseCategory?: string;
  icon?: string;
  category_id?: string; // For Drawer / Source of Funds
}

export interface CashoutRecord {
  id: string;
  date: string;
  timestamp: string;
  amount: number;
  category: CashoutType;
  notes?: string;
  product?: string;
  expenseCategory?: string;
  icon?: string;
  subTypeLabel?: string;
  manufacturer?: string;
  receiptNo?: string;
  referenceNo?: string;
  created_at: string;
}

export interface OpexCategory {
  id: string | number;
  name: string;
  icon: string;
}

export interface Classification {
  id: string;
  name: string;
  store_id: string;
  icon?: string;
}

export interface CashoutPermissions {
  can_manage_expenses: boolean;
}

// --- API METHODS ---

// 0. Fetch User Permissions
export const fetchUserPermissions = async (): Promise<CashoutPermissions> => {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { can_manage_expenses: false };

  const { data, error } = await supabase
    .from("staff_permissions")
    .select("can_manage_expenses")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching permissions:", error);
    // Fallback: If not found in staff_permissions, check if user is admin
    const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", user.id)
        .single();
    
    return { can_manage_expenses: userData?.role === 'admin' };
  }

  return {
    can_manage_expenses: data?.can_manage_expenses || false
  };
};

// 1. Fetch Expenses Breakdown (Integrated & Typed)
export const fetchExpensesBreakdown = async (
  startDate: string,
  endDate: string
) => {
  const supabase = await getSupabase();

  // Fetch expenses with their associated source and classification name
  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
      amount,
      classification_details:classification_id (
        name
      ),
      product_category!inner (
        category
      )
    `
    )
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    // Filter out rows where the FK might be null (if any)
    .not("classification_id", "is", null)
    .returns<ExpenseBreakdownRow[]>();

  if (error) {
    console.error("Error fetching expense breakdown:", error);
    throw error;
  }

  // Aggregate the data: Group by Source -> Classification
  const aggregated: Record<string, Record<string, number>> = {};

  data?.forEach((item) => {
    const source = item.product_category?.category || "Uncategorized";
    // Use the name from the joined table
    const classification = item.classification_details?.name || "Other";
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
): Promise<CashoutRecord[]> => {
  const supabase = await getSupabase();

  let query = supabase
    .from("expenses")
    .select(
      `
      *,
      product_category (
        category
      ),
      classification_details:classification_id (
        name
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
    (row: any): CashoutRecord => ({
      id: row.id,
      date: row.transaction_date,
      timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: row.created_at,
      // Map the joined name to the flat object for the UI
      category: row.cashout_type || 'OPEX', // Default fallback
      amount: row.amount,
      receiptNo: row.receipt_no ?? "",
      notes: row.notes ?? "",
      
      // Details
      expenseCategory: row.classification_details?.name ?? (row.cashout_type === 'OPEX' ? "Unclassified" : undefined),
      product: row.product_category?.category || row.source, // fallback handling
      
      // We might need to handle other fields based on the raw data
    })
  );
};

// 2b. Fetch Expenses with Pagination (Infinite Scroll)
export const fetchExpensesPaginated = async (
  page: number,
  pageSize: number,
  startDate?: string,
  endDate?: string
): Promise<{ data: CashoutRecord[]; count: number }> => {
  const supabase = await getSupabase();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("expenses")
    .select(
      `
      *,
      product_category (
        category
      ),
      classification_details:classification_id (
        name
      )
    `,
      { count: "exact" }
    )
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  // Apply date filters only if provided
  if (startDate) {
    query = query.gte("transaction_date", startDate);
  }
  if (endDate) {
    query = query.lte("transaction_date", endDate);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const mappedData = (data || []).map(
    (row: any): CashoutRecord => ({
      id: row.id,
      date: row.transaction_date,
      timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: row.created_at,
      category: row.cashout_type || 'OPEX',
      amount: row.amount,
      receiptNo: row.receipt_no ?? "",
      notes: row.notes ?? "",
      
      expenseCategory: row.classification_details?.name,
      product: row.product_category?.category || row.source
    })
  );

  return { data: mappedData, count: count ?? 0 };
};

// 2c. Fetch Expenses Summary (Totals)
export const fetchExpensesSummary = async (
  startDate?: string,
  endDate?: string
): Promise<{ totalAmount: number; totalCount: number }> => {
  const supabase = await getSupabase();
  
  let query = supabase
    .from("expenses")
    .select("amount", { count: "exact" });

  if (startDate) {
    query = query.gte("transaction_date", startDate);
  }
  if (endDate) {
    query = query.lte("transaction_date", endDate);
  }

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  const totalAmount = data?.reduce((sum, row) => sum + (row.amount || 0), 0) || 0;

  return { 
    totalAmount, 
    totalCount: count || 0 
  };
};

// 3. Create Expense (RPC)
export const createExpense = async (input: CashoutInput) => {
  const supabase = await getSupabase();
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // 2. Resolve store_id if missing
  let storeId = input.store_id;
  if (!storeId) {
    const { data: userData } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();
    storeId = userData?.store_id;
  }

  if (!storeId) {
    throw new Error("Store ID not found for user. Please ensure you are assigned to a store.");
  }

  // 3. Call the RPC
  const { error } = await supabase.rpc("insert_new_expense", {
    transaction_date_in: input.transaction_date,
    amount_in: input.amount,
    notes_in: input.notes,
    store_id_in: storeId, 
    classification_id_in: input.classification_id || null, 
    cashout_type_in: input.cashout_type,
    metadata_in: input.metadata || {},
    receipt_no_in: input.receipt_no || null, 
    category_id_in: input.category_id || null 
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

  // Auto-seed if empty for this store
  if (!data || data.length === 0) {
    await seedClassifications();
    // Re-fetch after seeding
    const { data: seededData } = await supabase
      .from("classification")
      .select("*")
      .order("name", { ascending: true });
    return seededData || [];
  }

  return data || [];
};

// 4b. Seed Default Classifications
export const seedClassifications = async () => {
  const supabase = await getSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: userData } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (!userData?.store_id) return;

  const defaults = [
    { name: 'Utilities', icon: 'Lightbulb' },
    { name: 'Rent & Lease', icon: 'Store' },
    { name: 'Supplier Payment', icon: 'Truck' },
    { name: 'Salaries', icon: 'User' },
    { name: 'Maintenance', icon: 'Wrench' },
    { name: 'Internet/Comm', icon: 'Wifi' },
    { name: 'Supplies', icon: 'Coffee' },
    { name: 'Marketing', icon: 'Briefcase' },
    { name: 'Taxes & Permits', icon: 'ShieldCheck' }
  ];

  const insertData = defaults.map(d => ({
    name: d.name,
    icon: d.icon,
    store_id: userData.store_id
  }));

  const { error } = await supabase.from("classification").insert(insertData);
  if (error) console.error("Error seeding classifications:", error);
};

// 5. Create Classification
export const createClassification = async (name: string, icon: string = 'Store') => {
  const supabase = await getSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: userData } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase.from("classification").insert({
    name,
    icon,
    store_id: userData?.store_id
  });

  if (error) {
    console.error("Error creating classification:", error);
    throw new Error(error.message);
  }
};

// 6. Update Classification
export const updateClassification = async (id: string, name: string, icon?: string) => {
  const supabase = await getSupabase();
  const updateData: any = { name };
  if (icon) updateData.icon = icon;

  const { error } = await supabase
    .from("classification")
    .update(updateData)
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

// 8. Delete Expense
export const deleteExpense = async (id: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) {
    console.error("Error deleting expense:", error);
    throw new Error(error.message);
  }
};

// --- DATA INTEGRITY / TRANSFER ---

// 10. Check Classification Usage
export const checkClassificationUsage = async (id: string): Promise<number> => {
  const supabase = await getSupabase();
  const { count, error } = await supabase
    .from("expenses")
    .select("*", { count: 'exact', head: true })
    .eq("classification_id", id);

  if (error) throw error;
  return count || 0;
};

// 11. Transfer Classification
export const transferClassification = async (fromId: string, toId: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("expenses")
    .update({ classification_id: toId })
    .eq("classification_id", fromId);

  if (error) throw error;
  
  // After transfer, delete the old one
  await deleteClassification(fromId);
};

// 9. Update Expense (Direct Update)
export const updateExpense = async (id: string, input: CashoutInput) => {
  const supabase = await getSupabase();
  
  const { error } = await supabase
    .from("expenses")
    .update({
      transaction_date: input.transaction_date,
      // source: input.source, // Removed or mapped?
      classification_id: input.classification_id, 
      amount: input.amount,
      receipt_no: input.receipt_no,
      notes: input.notes,
      cashout_type: input.cashout_type,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating expense:", error);
    throw new Error(error.message);
  }
};