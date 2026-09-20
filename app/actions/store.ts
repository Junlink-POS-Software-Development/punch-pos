"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  BusinessMode,
  ModulesConfig,
  IndustryConfig,
  DEFAULT_MODULES_CONFIG,
  BUSINESS_MODE_PRESETS,
} from "@/lib/types/businessMode";

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

    // 3. Refresh session to update JWT claims immediately
    await supabase.auth.refreshSession();

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
  
  console.log("Upload result:", { data: uploadData, error: uploadError });

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
 * Updates store_name, store_img, business_mode, modules_enabled, and industry_config for the current user's store.
 */
export async function updateStoreInfo(data: {
  storeName?: string;
  storeImg?: string;
  businessMode?: BusinessMode;
  modulesEnabled?: ModulesConfig;
  industryConfig?: IndustryConfig;
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
    
    console.log("Debug updateStoreInfo:", {
      userId: user.id,
      appMetadata: user.app_metadata,
      userData: userData,
      userError: userError
    });

    if (userError || !userData?.store_id) {
      return { success: false, error: "Store not found for user" };
    }

    const updatePayload: Record<string, any> = {};
    if (data.storeName !== undefined) updatePayload.store_name = data.storeName;
    if (data.storeImg !== undefined) updatePayload.store_img = data.storeImg;
    if (data.businessMode !== undefined) updatePayload.business_mode = data.businessMode;
    if (data.modulesEnabled !== undefined) updatePayload.modules_enabled = data.modulesEnabled;
    if (data.industryConfig !== undefined) updatePayload.industry_config = data.industryConfig;

    if (Object.keys(updatePayload).length === 0) {
      return { success: true };
    }

    const { data: updateResult, error: updateError } = await supabase
      .from("stores")
      .update(updatePayload)
      .eq("store_id", userData.store_id)
      .select();

    console.log("Update payload:", updatePayload);
    console.log("Update result:", { data: updateResult, error: updateError });

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
 * Convenience helper to switch business mode and optionally apply module presets.
 */
export async function updateStoreBusinessMode(
  businessMode: BusinessMode,
  customModules?: Partial<ModulesConfig>,
  industryConfig?: IndustryConfig
) {
  const preset = BUSINESS_MODE_PRESETS[businessMode];
  const modulesToSave: ModulesConfig = {
    ...(preset?.defaultModules || DEFAULT_MODULES_CONFIG),
    ...(customModules || {}),
  };

  return updateStoreInfo({
    businessMode,
    modulesEnabled: modulesToSave,
    industryConfig,
  });
}

/**
 * Fetches store_name, store_img, business_mode, modules_enabled, and industry_config for the current store.
 */
export async function getStoreInfo(): Promise<{
  success: boolean;
  error?: string;
  storeName?: string;
  storeImg?: string | null;
  businessMode?: BusinessMode;
  modulesEnabled?: ModulesConfig;
  industryConfig?: IndustryConfig;
}> {
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
      .select("store_name, store_img, business_mode, modules_enabled, industry_config")
      .eq("store_id", userData.store_id)
      .single();

    if (storeError) {
      return { success: false, error: storeError.message };
    }

    return {
      success: true,
      storeName: storeData.store_name,
      storeImg: storeData.store_img,
      businessMode: (storeData.business_mode as BusinessMode) || "retail",
      modulesEnabled: (storeData.modules_enabled as ModulesConfig) || DEFAULT_MODULES_CONFIG,
      industryConfig: (storeData.industry_config as IndustryConfig) || {},
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all stores the current user has access to via staff_permissions.
 * Returns an array of { store_id, store_name, store_img, role }.
 */
export async function getUserStores() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return { success: false, error: "Not authenticated", stores: [] };

    // Query the stores table directly. 
    // RLS policies will automatically filter this to only stores the user is allowed to see.
    const { data: storesData, error: storesError } = await supabase
      .from("stores")
      .select("store_id, store_name, store_img, user_id, co_admins");

    if (storesError) {
      console.error("Error fetching stores:", storesError);
      return { success: false, error: storesError.message, stores: [] };
    }

    // Determine the user's role for the UI based on ownership/co-admin status
    const stores = (storesData || []).map((store) => {
      let role = "staff";
      
      if (store.user_id === user.id) {
        role = "owner";
      } else if (store.co_admins && store.co_admins.includes(user.id)) {
        role = "co-admin";
      }

      return {
        store_id: store.store_id,
        store_name: store.store_name,
        store_img: store.store_img,
        role: role,
      };
    });

    return { success: true, stores };
  } catch (error: any) {
    console.error("Unexpected error in getUserStores:", error);
    return { success: false, error: error.message, stores: [] };
  }
}

/**
 * Switches the user's active store by calling the switch_active_store RPC,
 * then refreshes the session to update JWT claims.
 */
export async function switchActiveStore(targetStoreId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    // Call the RPC to switch stores
    const { data: rpcData, error: rpcError } = await supabase.rpc("switch_active_store", {
      target_store_id: targetStoreId,
    });

    if (rpcError) {
      console.error("Error switching store:", rpcError);
      return { success: false, error: rpcError.message };
    }

    const result = rpcData as { success: boolean; error?: string; message?: string } | null;
    if (result && result.success === false) {
      console.log("switch_active_store RPC returned logic error:", result.error || result.message);
      return { success: false, error: result.error || result.message || "Unauthorized to enter this store." };
    }

    // Refresh session to get updated JWT claims
    const { error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      console.error("Error refreshing session:", refreshError);
      return { success: false, error: "Store switched but session refresh failed. Please log out and back in." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error switching store:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates the store's drawer mode (unified or multiple).
 * Unified = single cash pool. Multiple = per-category drawers.
 */
export async function updateDrawerMode(mode: "unified" | "multiple") {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
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

    // 2. Update drawer_mode
    const { error: updateError } = await supabase
      .from("stores")
      .update({ drawer_mode: mode })
      .eq("store_id", userData.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 3. If switching to unified, reset all is_default_voucher_source to false
    if (mode === "unified") {
      const { error: resetError } = await supabase
        .from("product_category")
        .update({ is_default_voucher_source: false })
        .eq("store_id", userData.store_id);
      
      if (resetError) {
        console.error("Error resetting voucher sources:", resetError);
      }
    }

    // 4. Revalidate affected paths
    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Leaves the current store. Requires password confirmation.
 */
export async function leaveStore(password: string) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return { success: false, error: "Not authenticated" };

    // 1. Verify Password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (authError) {
      return { success: false, error: "Incorrect password." };
    }

    // 2. Remove user from store and set role to admin
    const { error: updateError } = await supabase
      .from("users")
      .update({ store_id: null, role: "admin" })
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 3. Remove permissions
    await supabase.from("staff_permissions").delete().eq("user_id", user.id);

    // Refresh session to get updated JWT claims (so that role and store_id are null)
    await supabase.auth.refreshSession();

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generates a random 8-character alphanumeric enrollment code for the store.
 * Sets enrollment_code_expires_at to 1 hour from now.
 */
export async function generateEnrollmentCode() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
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

    // 2. Generate a random 8-character alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 3. Update store with new code and expiry (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("stores")
      .update({
        enrollment_id: code,
        enrollment_code_expires_at: expiresAt,
      })
      .eq("store_id", userData.store_id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath("/settings");
    return { success: true, code, expiresAt };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches the current enrollment code and its expiry for the user's store.
 */
export async function getEnrollmentCodeStatus() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
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

    // 2. Fetch enrollment_id and enrollment_code_expires_at
    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("enrollment_id, enrollment_code_expires_at")
      .eq("store_id", userData.store_id)
      .single();

    if (storeError) {
      return { success: false, error: storeError.message };
    }

    return {
      success: true,
      code: storeData.enrollment_id,
      expiresAt: storeData.enrollment_code_expires_at,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
