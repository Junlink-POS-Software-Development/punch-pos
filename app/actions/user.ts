"use server";

import { createClient } from "@/utils/supabase/server";

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
