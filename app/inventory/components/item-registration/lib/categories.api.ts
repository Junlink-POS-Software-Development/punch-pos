"use server";

import { createClient } from "@/utils/supabase/server";

const getSupabase = async () => {
  return await createClient();
};

export interface Category {
  id: string;
  category: string;
  is_default_voucher_source?: boolean;
}

// 1. Fetch
export const fetchCategories = async (): Promise<Category[]> => {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("product_category")
    .select("id, category, is_default_voucher_source")
    .order("category", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

// 2. Create (Using the RPC we created for safe insertion)
export const createCategory = async (name: string): Promise<Category | null> => {
  const supabase = await getSupabase();
  // Option A: If using RPC (Recommended for strict RLS)
  const { error } = await supabase.rpc("insert_product_category", {
    category_name: name,
  });
  
  if (error) throw new Error(error.message);

  // Fetch the newly created item to return it (since RPC returns void)
  const { data } = await supabase
    .from("product_category")
    .select("id, category, is_default_voucher_source")
    .eq("category", name)
    .single();
    
  return data;
};

// 3. Update
export const updateCategory = async (id: string, name: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("product_category")
    .update({ category: name })
    .eq("id", id);

  if (error) throw new Error(error.message);
};

// 4. Delete
export const deleteCategory = async (id: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("product_category")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};

// 5. Set Default Voucher Source
export const setDefaultVoucherSource = async (id: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase
    .from("product_category")
    .update({ is_default_voucher_source: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
};