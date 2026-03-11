"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * ─── Customer Groups ─────────────────────────────────────────────────────────
 */

export async function createGroup(name: string) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const role = user.user_metadata?.role || "user";
    const isAdmin = role === "admin";

    // 2. Insert group
    const { data, error } = await supabase.from("customer_groups").insert({
      name,
      store_id: user.user_metadata?.store_id,
      created_by: user.id,
      is_shared: isAdmin,
    }).select().single();

    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    revalidatePath("/customers");

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteGroup(id: string) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Delete group
    const { error } = await supabase.from("customer_groups").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function renameCustomerGroup(groupId: string, name: string) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Update group name
    const { error } = await supabase
      .from("customer_groups")
      .update({ name })
      .eq("id", groupId);

    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * ─── Customers ──────────────────────────────────────────────────────────────
 */

export async function createCustomerAction(formData: FormData) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Get Store ID
    const { data: userData } = await supabase
      .from('users')
      .select('store_id')
      .eq('user_id', user.id)
      .single();

    if (!userData?.store_id) return { success: false, error: "No store found." };

    // 3. Upload Documents
    const files = formData.getAll("documents");
    const uploadedUrls: string[] = [];
    const uploadFailures: string[] = [];

    for (const file of files) {
      if (file instanceof File && file.type.startsWith("image/")) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `customers/${user.id}/${Date.now()}_${safeName}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from("customer-documents")
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          uploadFailures.push(file.name);
          continue;
        }

        if (data) {
          const { data: urlData } = supabase.storage.from("customer-documents").getPublicUrl(data.path);
          uploadedUrls.push(urlData.publicUrl);
        }
      }
    }

    if (uploadFailures.length > 0 && uploadedUrls.length === 0 && files.length > 0) {
      return { 
        success: false, 
        error: `Failed to upload documents: ${uploadFailures.join(", ")}` 
      };
    }

    // 4. Prepare Payload
    const rawName = (formData.get("full_name") as string) || "";
    const rawDate = formData.get("birthdate") as string;
    const groupId = formData.get("group_id") as string;
    
    const payload = {
      p_full_name: rawName.trim(),
      p_birthdate: rawDate ? rawDate : null,
      p_phone_number: (formData.get("phone_number") as string)?.trim() || null,
      p_email: (formData.get("email") as string)?.trim() || null,
      p_address: (formData.get("address") as string)?.trim() || null,
      p_remarks: (formData.get("remarks") as string)?.trim() || null,
      p_group_id: (groupId && groupId !== "null" && groupId !== "") ? groupId : null,
      p_civil_status: (formData.get("civil_status") as string) || null,
      p_gender: (formData.get("gender") as string) || null,
      p_documents: uploadedUrls,
      p_store_id: userData.store_id,
      p_confirm_duplicate: formData.get("confirmed") === "true"
    };

    // 5. Call RPC
    const { data: rpcResult, error } = await supabase.rpc('manage_customer_creation', payload);

    if (error) return { success: false, error: error.message };

    // 6. Revalidate
    revalidatePath("/customers");

    return { 
      success: rpcResult.status === 'success', 
      status: rpcResult.status,
      error: rpcResult.message, 
      data: rpcResult.data 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerAction(
  customerId: string,
  data: any
) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Update customer
    const { error } = await supabase.from("customers").update(data).eq("id", customerId);
    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerAction(customerId: string) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Delete customer
    const { error } = await supabase.from("customers").delete().eq("id", customerId);
    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerGroupAction(
  customerId: string,
  groupId: string | null
) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Update group
    const { error } = await supabase
      .from("customers")
      .update({ group_id: groupId })
      .eq("id", customerId);

    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateCustomerGroupAction(
  customerIds: string[],
  groupId: string | null
) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Bulk update
    const { error } = await supabase
      .from("customers")
      .update({ group_id: groupId })
      .in("id", customerIds);

    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCustomerLockAction(
  customerId: string,
  isLocked: boolean,
  currentMetadata: any
) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Toggle lock
    const updatedMetadata = {
      ...currentMetadata,
      isLocked,
    };
    const { error } = await supabase
      .from("customers")
      .update({ document_metadata: updatedMetadata })
      .eq("id", customerId);

    if (error) return { success: false, error: error.message };

    // 3. Revalidate
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerDocumentAction(
  customerId: string,
  fileUrl: string
) {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // 2. Get current documents
    const { data: customer } = await supabase
      .from("customers")
      .select("documents")
      .eq("id", customerId)
      .single();

    if (!customer || !customer.documents) return { success: false, error: "Customer not found" };

    const updatedDocs = customer.documents.filter((doc: string) => doc !== fileUrl);

    // 3. Update database
    const { error: updateError } = await supabase
      .from("customers")
      .update({ documents: updatedDocs })
      .eq("id", customerId);

    if (updateError) return { success: false, error: updateError.message };

    // 4. Delete from storage
    try {
      const urlObj = new URL(fileUrl);
      const path = urlObj.pathname.split("/customer-documents/")[1];
      if (path) {
        await supabase.storage.from("customer-documents").remove([path]);
      }
    } catch (e) {
      console.warn("Could not delete file from storage:", e);
    }

    // 5. Revalidate
    revalidatePath("/customers");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
