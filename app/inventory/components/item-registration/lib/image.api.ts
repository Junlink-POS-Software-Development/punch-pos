"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Uploads an item thumbnail image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export const uploadItemImage = async (formData: FormData): Promise<string> => {
  const supabase = await createClient();

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File)) {
    throw new Error("No file provided");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `items/${user.id}/${Date.now()}_${safeName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("item-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Item image upload error:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("item-images")
    .getPublicUrl(uploadData.path);

  return publicUrl;
};
