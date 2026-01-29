"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  jobTitle: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Update auth metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      first_name: data.firstName,
      last_name: data.lastName,
      job_title: data.jobTitle,
    },
  });

  if (authError) {
    console.error("Error updating auth metadata:", authError);
    // Continue anyway to update public.users
  }

  // Fetch existing metadata to merge
  const { data: userData } = await supabase
    .from("users")
    .select("metadata")
    .eq("user_id", user.id)
    .single();

  const currentMetadata = (userData?.metadata as Record<string, any>) || {};
  const newMetadata = { ...currentMetadata, job_title: data.jobTitle };

  // Update public.users
  const { error } = await supabase
    .from("users")
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      metadata: newMetadata,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
