import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const fetchCustomerFeatureData = async (
  startDate?: string,
  endDate?: string
) => {
  const supabase = createClient();

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
      .order("created_at", { ascending: false }),
    guestQuery,
  ]);

  return {
    groups: groupsRes.data || [],
    customers: customersRes.data || [],
    guestTransactions: guestRes.data || [],
  };
};

export const fetchDashboardData = async () => {
  const { data: groups } = await supabase
    .from("customer_groups")
    .select("*")
    .order("name");

  const { data: customers } = await supabase
    .from("customers")
    .select("*, group:customer_groups(*)")
    .order("created_at", { ascending: false });

  return { groups: groups || [], customers: customers || [] };
};

export const createGroup = async (name: string) => {
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
  return await supabase.from("customer_groups").delete().eq("id", id);
};

// [REVISED] Updated to accept FormData for file uploads
export const createCustomer = async (formData: FormData) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user found");

  // 1. Extract Fields (Same as before)
  const full_name = formData.get("full_name") as string;
  const phone_number = formData.get("phone_number") as string;
  const emailRaw = formData.get("email") as string;
  const email = emailRaw || null;
  const addressRaw = formData.get("address") as string;
  const address = addressRaw || null;
  const remarksRaw = formData.get("remarks") as string;
  const remarks = remarksRaw || null;
  const birthdateRaw = formData.get("birthdate") as string;
  const birthdate = birthdateRaw || null;
  const dateRegRaw = formData.get("date_of_registration") as string;
  const date_of_registration = dateRegRaw || new Date().toISOString().split("T")[0];

  const groupIdRaw = formData.get("group_id") as string;
  const group_id = groupIdRaw && groupIdRaw !== "" ? groupIdRaw : null;

  const civil_status = (formData.get("civil_status") as string) || null;
  const gender = (formData.get("gender") as string) || null;

  // Fetch store_id from members table instead of metadata
  const { data: memberData, error: memberError } = await supabase
    .from("members")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (memberError || !memberData?.store_id) {
    console.error("Store ID fetch error:", memberError);
    throw new Error("User has no associated store_id in members table");
  }
  
  const store_id = memberData.store_id;

  // 2. Handle Image Uploads
  const files = formData.getAll("documents");
  const uploadedUrls: string[] = [];

  if (files.length > 0) {
    for (const fileEntry of files) {
      if (fileEntry instanceof File) {
        const file = fileEntry;

        // [NEW] Validation: Ensure it's an image
        if (!file.type.startsWith("image/")) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }

        // Create path: customers/{user_id}/{timestamp}_{safe_filename}
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `customers/${user.id}/${Date.now()}_${safeName}`;

        // [NEW] Upload to 'customer-documents' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("customer-documents") // <--- CHANGED HERE
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          continue;
        }

        if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("customer-documents") // <--- CHANGED HERE
            .getPublicUrl(uploadData.path);

          uploadedUrls.push(publicUrl);
        }
      }
    }
  }

  // 3. Insert Record (No changes needed to schema, text[] is correct for URLs)
  return await supabase.from("customers").insert({
    full_name,
    phone_number,
    email,
    address,
    remarks,
    birthdate,
    date_of_registration,
    group_id,
    civil_status,
    gender,
    documents: uploadedUrls,
    store_id,
  });
};

export const updateCustomerGroup = async (
  customerId: string,
  groupId: string
) => {
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
  return await supabase.from("customers").update(data).eq("id", customerId);
};

export const uploadCustomerDocument = async (
  customerId: string,
  file: File
) => {
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
  return await supabase
    .from("customers")
    .update({ document_metadata: metadata })
    .eq("id", customerId);
};

export const deleteCustomerDocument = async (
  customerId: string,
  fileUrl: string
) => {
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
  return await supabase
    .from("customer_groups")
    .update({ name })
    .eq("id", groupId);
};

export const deleteCustomer = async (customerId: string) => {
  return await supabase.from("customers").delete().eq("id", customerId);
};

export const bulkUpdateCustomerGroup = async (
  customerIds: string[],
  groupId: string
) => {
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
  const updatedMetadata = {
    ...currentMetadata,
    isLocked,
  };
  return await supabase
    .from("customers")
    .update({ document_metadata: updatedMetadata })
    .eq("id", customerId);
};
