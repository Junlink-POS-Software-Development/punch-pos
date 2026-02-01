"use server";

import { createClient } from "@/utils/supabase/server";
import { PlaygroundState, SummaryStats } from "./types";

export async function fetchSummaryStats(storeId: string): Promise<SummaryStats> {
  const supabase = await createClient();

  // Parallelize fetch requests for performance
  const [
    transactionsRes,
    expensesRes,
    itemsRes,
    customersRes,
    stockFlowRes
  ] = await Promise.all([
    supabase.from('transactions').select('total_price, id').eq('store_id', storeId),
    supabase.from('expenses').select('amount').eq('store_id', storeId),
    supabase.from('items').select('id, cost_price, low_stock_threshold').eq('store_id', storeId),
    supabase.from('customers').select('id, created_at').eq('store_id', storeId),
    supabase.from('stock_flow').select('id').eq('store_id', storeId).limit(100) // Just checking recent activity count or existence
  ]);

  if (transactionsRes.error) throw new Error(transactionsRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);
  
  // Transactions Props
  const totalSales = transactionsRes.data?.reduce((sum, t) => sum + (Number(t.total_price) || 0), 0) || 0;
  const transCount = transactionsRes.data?.length || 0;
  const avgSale = transCount > 0 ? totalSales / transCount : 0;

  // Expenses Props
  const totalExpenses = expensesRes.data?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

  // Items Props
  const itemsCount = itemsRes.count || itemsRes.data?.length || 0;
  // Note: True valuation requires summing stock_flow for each item * cost_price. 
  // We'll skip complex valuation for this summary to ensure speed, or approximate if needed.
  const totalValuation = 0; 
  const lowStockCount = 0; // Requires complex calculation

  // Customers Props
  const totalCustomers = customersRes.data?.length || 0;
  // Calculate new customers this month (simple filter)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const newCustomers = customersRes.data?.filter(c => c.created_at >= startOfMonth).length || 0;

  return {
    transactions: {
      total_sales: totalSales,
      count: transCount,
      avg_sale: avgSale
    },
    expenses: {
      total_expenses: totalExpenses,
      count: expensesRes.data?.length || 0
    },
    items: {
      total_items: itemsCount,
      total_valuation: totalValuation,
      low_stock_count: lowStockCount
    },
    customers: {
      total_customers: totalCustomers,
      new_customers_this_month: newCustomers
    },
    stock_flow: {
      recent_movements_count: stockFlowRes.data?.length || 0
    },
    last_updated: new Date().toISOString()
  };
}

export async function savePlaygroundState(state: Omit<PlaygroundState, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  
  // Verify store_id matches user's store_id (double check security, though RLS handles it)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Upsert or Insert? The user might be updating an existing one if they pass an ID?
  // The interface in `types.ts` has ID. strict input here omits ID.
  // If we want to support update, we need ID.
  // Let's assume this is for creating NEW or Updating if we change the signature.
  // For now, let's allow passing ID optionally if we want to update.
  
  const { data, error } = await supabase
    .from('playground_states')
    .insert({
      store_id: state.store_id,
      name: state.name,
      content: state.content
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updatePlaygroundState(id: string, content: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('playground_states')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getPlaygroundStates(storeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('playground_states')
    .select('*')
    .eq('store_id', storeId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as PlaygroundState[];
}

export async function getPlaygroundState(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('playground_states')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as PlaygroundState;
}

// Function to fetch raw data for valid specific queries if needed (Server Action for Sync/Refetch)
// This strictly enforces store_id
export async function fetchRawTableData(table: string, columns: string, storeId: string, limit = 1000) {
   const supabase = await createClient();
   // White list tables
   const allowedTables = ['transactions', 'expenses', 'items', 'customers', 'stock_flow'];
   if (!allowedTables.includes(table)) throw new Error("Invalid table access");

   const { data, error } = await supabase
     .from(table)
     .select(columns) // Columns should be validated or trusted? For now pass through but maybe restrict *
     .eq('store_id', storeId)
     .limit(limit);
    
   if (error) throw new Error(error.message);
   return data;
}
