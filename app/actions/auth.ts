"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SignInFormValues, SignUpFormValues } from "@/lib/types";

export async function login(formData: SignInFormValues) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.session) {
    return { success: false, error: "Sign in successful but no session created." };
  }

  // Verify user role
  const { data: userData, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("user_id", data.session.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    return { success: false, error: "Could not verify user role." };
  }

  if (userData.role !== "member") {
    await supabase.auth.signOut();
    if (userData.role === "admin") {
      return { success: false, error: "Access denied. Admins must sign in via the admin app." };
    } else {
      return { success: false, error: `Access denied. Your role (${userData.role}) is not 'member'.` };
    }
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function checkSession() {
  const supabase = await createClient();
  try {
    // Use getUser() instead of getSession() for security
    // getUser() authenticates by contacting the Supabase Auth server
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { success: false };
    }
    return { success: true, user };
  } catch (error) {
    return { success: false };
  }
}

// --- SIGN UP ---
export async function signUp(values: SignUpFormValues) {
  const supabase = await createClient();
  
  const { error: authError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        signup_type: "member",
        role: "member",
        first_name: values.firstName,
        last_name: values.lastName,
        contact_email: values.email,
        job_title: values.jobTitle,
        enrollment_id: values.enrollmentId,
      },
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  return { success: true };
}
