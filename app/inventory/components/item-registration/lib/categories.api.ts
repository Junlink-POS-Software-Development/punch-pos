// app/inventory/components/item-registration/lib/categories.api.ts
import { supabase } from "@/lib/supabaseClient";

export interface Category {
  id: string;
  category: string;
}

// 1. Fetch
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("product_category")
    .select("id, category")
    .order("category", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

// 2. Create (Using the RPC we created for safe insertion)
export const createCategory = async (name: string): Promise<Category | null> => {
  // Option A: If using RPC (Recommended for strict RLS)
  const { error } = await supabase.rpc("insert_product_category", {
    category_name: name,
  });
  
  if (error) throw new Error(error.message);

  // Fetch the newly created item to return it (since RPC returns void)
  const { data } = await supabase
    .from("product_category")
    .select("id, category")
    .eq("category", name)
    .single();
    
  return data;
};

// 3. Update
export const updateCategory = async (id: string, name: string) => {
  const { error } = await supabase
    .from("product_category")
    .update({ category: name })
    .eq("id", id);

  if (error) throw new Error(error.message);
};

// 4. Delete
export const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from("product_category")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
};