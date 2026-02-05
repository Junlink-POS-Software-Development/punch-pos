"use server";

import { createClient } from "@/utils/supabase/server";

export const fetchCustomerFeatureData = async (
  startDate?: string,
  endDate?: string
) => {
  const supabase = await createClient();

  // Build the guest transactions query with optional date filters
  let guestQuery = supabase
    .from("view_guest_transactions")
    .select("*")
    .order("transaction_time", { ascending: false });

  // Apply date filters if provided
  if (startDate) {
    guestQuery = guestQuery.gte("transaction_time", startDate);
  }
  if (endDate) {
    // Add one day to include the full end date
    const endDateTime = new Date(endDate);
    endDateTime.setDate(endDateTime.getDate() + 1);
    guestQuery = guestQuery.lt("transaction_time", endDateTime.toISOString());
  }

  const [groupsRes, customersRes, guestRes] = await Promise.all([
    supabase.from("customer_groups").select("*").order("name"),
    supabase
      .from("customers")
      .select("*, group:customer_groups(*)")
      .order("full_name", { ascending: true }),
    guestQuery,
  ]);

  return {
    groups: groupsRes.data || [],
    customers: customersRes.data || [],
    guestTransactions: guestRes.data || [],
  };
};

export const fetchDashboardData = async () => {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("customer_groups")
    .select("*")
    .order("name");

  const { data: customers } = await supabase
    .from("customers")
    .select("*, group:customer_groups(*)")
    .order("full_name", { ascending: true });

  return { groups: groups || [], customers: customers || [] };
};

export const createGroup = async (name: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  const role = user.user_metadata?.role || "user";
  const isAdmin = role === "admin";

  return await supabase.from("customer_groups").insert({
    name,
    store_id: user.user_metadata?.store_id,
    created_by: user.id,
    is_shared: isAdmin,
  });
};

export const deleteGroup = async (id: string) => {
  const supabase = await createClient();
  return await supabase.from("customer_groups").delete().eq("id", id);
};


export const createCustomer = async (formData: FormData) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No user found");

  // 1. Get Store ID
  const { data: userData } = await supabase
    .from('users')
    .select('store_id')
    .eq('user_id', user.id)
    .single();

  if (!userData?.store_id) return { status: "error", error: "No store found." };

  // 2. Upload Logic (Robust Error Handling)
  const files = formData.getAll("documents");
  const uploadedUrls: string[] = [];
  const uploadFailures: string[] = [];

  for (const file of files) {
    if (file instanceof File && file.type.startsWith("image/")) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `customers/${user.id}/${Date.now()}_${safeName}`;
      
      try {
        const { data, error: uploadError } = await supabase.storage
          .from("customer-documents")
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          uploadFailures.push(file.name);
          continue;
        }

        if (data) {
          const { data: urlData } = supabase.storage.from("customer-documents").getPublicUrl(data.path);
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (e) {
        console.error(`Exception during upload for ${file.name}:`, e);
        uploadFailures.push(file.name);
      }
    }
  }

  // If some files failed but others succeeded, we might want to tell the user
  if (uploadFailures.length > 0 && uploadedUrls.length === 0 && files.length > 0) {
    return { 
      status: "error", 
      error: `Failed to upload any documents: ${uploadFailures.join(", ")}. Please check your connection and try again.` 
    };
  }

  // 3. Prepare Payload (Strict Trimming)
  const rawName = (formData.get("full_name") as string) || "";
  const rawDate = formData.get("birthdate") as string;
  const groupId = formData.get("group_id") as string;
  
  const payload = {
    p_full_name: rawName.trim(), // Remove leading/trailing spaces
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

  // 4. Call RPC
  const { data: rpcResult, error } = await supabase.rpc('manage_customer_creation', payload);

  if (error) {
    console.error("RPC Error:", error);
    return { status: 'error', error: error.message };
  }

  return { 
    status: rpcResult.status, 
    error: rpcResult.message, 
    data: rpcResult.data 
  };
};

export const updateCustomerGroup = async (
  customerId: string,
  groupId: string
) => {
  const supabase = await createClient();
  const val = groupId === "ungrouped" ? null : groupId;
  return await supabase
    .from("customers")
    .update({ group_id: val })
    .eq("id", customerId);
};

export const updateCustomer = async (
  customerId: string,
  data: Partial<any>
) => {
  const supabase = await createClient();
  return await supabase.from("customers").update(data).eq("id", customerId);
};

export const uploadCustomerDocument = async (
  customerId: string,
  file: File
) => {
  const supabase = await createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `customers/${customerId}/${Date.now()}_${safeName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("customer-documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("customer-documents").getPublicUrl(uploadData.path);

  return publicUrl;
};

export const updateCustomerDocumentMetadata = async (
  customerId: string,
  metadata: any
) => {
  const supabase = await createClient();
  return await supabase
    .from("customers")
    .update({ document_metadata: metadata })
    .eq("id", customerId);
};

export const deleteCustomerDocument = async (
  customerId: string,
  fileUrl: string
) => {
  const supabase = await createClient();
  // 1. Get current documents
  const { data: customer } = await supabase
    .from("customers")
    .select("documents")
    .eq("id", customerId)
    .single();

  if (!customer || !customer.documents) return;

  const updatedDocs = customer.documents.filter((doc: string) => doc !== fileUrl);

  // 2. Update documents array
  await supabase
    .from("customers")
    .update({ documents: updatedDocs })
    .eq("id", customerId);

  // 3. Optional: Delete from storage (if we can parse the path)
  // URL format: .../customer-documents/customers/user_id/timestamp_filename
  try {
    const urlObj = new URL(fileUrl);
    const path = urlObj.pathname.split("/customer-documents/")[1];
    if (path) {
      await supabase.storage.from("customer-documents").remove([path]);
    }
  } catch (e) {
    console.warn("Could not delete file from storage:", e);
  }
};

export const renameCustomerGroup = async (groupId: string, name: string) => {
  const supabase = await createClient();
  return await supabase
    .from("customer_groups")
    .update({ name })
    .eq("id", groupId);
};

export const deleteCustomer = async (customerId: string) => {
  const supabase = await createClient();
  return await supabase.from("customers").delete().eq("id", customerId);
};

export const bulkUpdateCustomerGroup = async (
  customerIds: string[],
  groupId: string
) => {
  const supabase = await createClient();
  const val = groupId === "ungrouped" ? null : groupId;
  return await supabase
    .from("customers")
    .update({ group_id: val })
    .in("id", customerIds);
};

export const toggleCustomerLock = async (
  customerId: string,
  isLocked: boolean,
  currentMetadata: any
) => {
  const supabase = await createClient();
  const updatedMetadata = {
    ...currentMetadata,
    isLocked,
  };
  return await supabase
    .from("customers")
    .update({ document_metadata: updatedMetadata })
    .eq("id", customerId);
};
