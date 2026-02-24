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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { success: false };
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    // Explicitly decode the token payload rather than trusting session.user
    if (session?.access_token) {
      try {
        const base64Url = session.access_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Node.js safe base64 decoding
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
        const decodedPayload = JSON.parse(jsonPayload);
        
        if (decodedPayload?.app_metadata) {
          user.app_metadata = {
            ...user.app_metadata,
            ...decodedPayload.app_metadata,
          };
        }
      } catch (decodeError) {
        console.error("Failed to decode token on server:", decodeError);
      }
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
        enrollment_id: values.enrollmentId || null,
      },
    },
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  return { success: true };
}
