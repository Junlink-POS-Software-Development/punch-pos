"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getStoreEnrollmentId() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // 1. Get user's store_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.store_id) {
      return { success: false, error: "Store not found for user" };
    }

    // 2. Get store's enrollment_id
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("enrollment_id")
      .eq("id", userData.store_id)
      .single();

    if (storeError) {
      return { success: false, error: storeError.message };
    }

    return { success: true, enrollmentId: storeData.enrollment_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStoreEnrollmentId(newEnrollmentId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Not authenticated" };

    // 1. Get user's store_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.store_id) {
      return { success: false, error: "Store not found for user" };
    }

    // 2. Update store's enrollment_id
    const { error: updateError } = await supabase
      .from("stores")
      .update({ enrollment_id: newEnrollmentId })
      .eq("id", userData.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function joinStoreViaEnrollmentId(enrollmentId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("join_store_via_enrollment_id", {
      provided_enrollment_id: enrollmentId,
    });

    if (error) {
      console.error("Error joining store:", error);
      return { success: false, error: error.message };
    }

    // The RPC should return a JSON object with success/error fields
    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      return { success: false, error: result.error || "Failed to join store." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error joining store:", error);
    return { success: false, error: error.message };
  }
}
