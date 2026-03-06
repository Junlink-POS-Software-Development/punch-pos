"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfileInfo() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("first_name, last_name, avatar, metadata")
      .eq("user_id", user.id)
      .single();

    if (userError) {
      return { success: false, error: userError.message };
    }

    return {
      success: true,
      firstName: userData.first_name,
      lastName: userData.last_name,
      avatar: userData.avatar,
      metadata: userData.metadata,
      email: user.email,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Uploads an avatar image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File)) {
    return { success: false, error: "No file provided" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${user.id}/${Date.now()}_${safeName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Avatar upload error details:", uploadError);
    return { success: false, error: `Upload failed: ${uploadError.message}` };
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(uploadData.path);

  if (!data?.publicUrl) {
    return { success: false, error: "Could not generate public URL" };
  }

  return { success: true, url: data.publicUrl };
}

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  phoneNumber?: string;
  avatar?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch existing user record to get current metadata
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("metadata")
    .eq("user_id", user.id)
    .single();
    
  if (userError) {
    return { success: false, error: userError.message };
  }

  const currentMetadata = (userData?.metadata as Record<string, any>) || {};
  const newMetadata = { ...currentMetadata };
  
  if (data.jobTitle !== undefined) newMetadata.job_title = data.jobTitle;
  if (data.phoneNumber !== undefined) newMetadata.phone_number = data.phoneNumber;

  // Update public.users
  const updatePayload: Record<string, any> = {
    metadata: newMetadata,
  };
  
  if (data.firstName !== undefined) updatePayload.first_name = data.firstName;
  if (data.lastName !== undefined) updatePayload.last_name = data.lastName;
  if (data.avatar !== undefined) updatePayload.avatar = data.avatar;

  const { error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating profile in public.users:", error);
    return { success: false, error: error.message };
  }

  // Update auth metadata
  const authMetadataUpdate: Record<string, any> = {};
  if (data.firstName !== undefined) authMetadataUpdate.first_name = data.firstName;
  if (data.lastName !== undefined) authMetadataUpdate.last_name = data.lastName;
  if (data.jobTitle !== undefined) authMetadataUpdate.job_title = data.jobTitle;
  if (data.avatar !== undefined) authMetadataUpdate.avatar_url = data.avatar;

  if (Object.keys(authMetadataUpdate).length > 0) {
    const { error: authError } = await supabase.auth.updateUser({
      data: authMetadataUpdate,
    });

    if (authError) {
        console.error("Error updating auth metadata:", authError);
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { success: true };
}
