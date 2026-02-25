"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function linkUserToStore(enrollmentId: string) {
  const supabase = await createClient();

  // 1. Query the stores table for the provided enrollment_id
  const { data: storeData, error: storeError } = await supabase
    .from("stores")
    .select("store_id, enrollment_code_expires_at")
    .eq("enrollment_id", enrollmentId)
    .single();

  if (storeError || !storeData) {
    return { success: false, error: "Invalid code" };
  }

  // 2. Validate expiration
  if (
    storeData.enrollment_code_expires_at &&
    new Date().toISOString() > storeData.enrollment_code_expires_at
  ) {
    return {
      success: false,
      error: "This enrollment code has expired. Please ask your store manager to generate a new one.",
    };
  }

  // 3. Proceed with standard enrollment process
  const { data, error } = await supabase.rpc("join_store", {
    provided_enrollment_id: enrollmentId,
  });

  if (error) {
    console.error("Error linking to store:", error);
    return { success: false, error: error.message };
  }

  // The RPC returns a JSON object with success/error fields
  // We need to cast it or check the properties
  const result = data as { success: boolean; error?: string; store_id?: string };

  if (!result.success) {
    return { success: false, error: result.error || "Failed to join store." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
