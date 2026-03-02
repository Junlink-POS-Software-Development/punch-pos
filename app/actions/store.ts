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
      .eq("store_id", userData.store_id)
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
      .eq("store_id", userData.store_id);

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
    // 1. FORCE AUTH INITIALIZATION: 
    // This ensures the Supabase client attaches the user JWT to the RPC call
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "You must be logged in to join a store." };
    }

    // 2. Call the RPC (which now securely handles the expiration and updates)
    const { data, error } = await supabase.rpc("join_store_via_enrollment_id", {
      provided_enrollment_id: enrollmentId,
    });

    if (error) {
      console.error("Error joining store:", error);
      return { success: false, error: error.message };
    }

    const result = data as { success: boolean; message?: string };

    if (!result.success) {
      return { success: false, error: result.message || "Failed to join store." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error joining store:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Uploads a store logo image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadStoreLogo(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File)) {
    return { success: false, error: "No file provided" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Use a cleaner path: user_id/timestamp_filename
  // This is a common pattern for Supabase Storage RLS policies
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/${Date.now()}_${safeName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("store_image")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Store logo upload error details:", uploadError);
    return { success: false, error: `Upload failed: ${uploadError.message}` };
  }

  const { data } = supabase.storage
    .from("store_image")
    .getPublicUrl(uploadData.path);

  if (!data?.publicUrl) {
    return { success: false, error: "Could not generate public URL" };
  }

  return { success: true, url: data.publicUrl };
}

/**
 * Updates store_name and optionally store_img for the current user's store.
 */
export async function updateStoreInfo(data: {
  storeName?: string;
  storeImg?: string;
}) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Get user's store_id
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.store_id) {
      return { success: false, error: "Store not found for user" };
    }

    const updatePayload: Record<string, any> = {};
    if (data.storeName !== undefined) updatePayload.store_name = data.storeName;
    if (data.storeImg !== undefined) updatePayload.store_img = data.storeImg;

    if (Object.keys(updatePayload).length === 0) {
      return { success: true };
    }

    const { error: updateError } = await supabase
      .from("stores")
      .update(updatePayload)
      .eq("store_id", userData.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches the store_name and store_img for the current user's store.
 */
export async function getStoreInfo() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("store_id")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.store_id) {
      return { success: false, error: "Store not found for user" };
    }

    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("store_name, store_img")
      .eq("store_id", userData.store_id)
      .single();

    if (storeError) {
      return { success: false, error: storeError.message };
    }

    return {
      success: true,
      storeName: storeData.store_name,
      storeImg: storeData.store_img,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
