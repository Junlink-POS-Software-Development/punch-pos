import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const fetchCustomerFeatureData = async () => {
  const supabase = createClient();

  const [groupsRes, customersRes, guestRes] = await Promise.all([
    supabase.from("customer_groups").select("*").order("name"),
    supabase
      .from("customers")
      .select("*, group:customer_groups(*)")
      .order("created_at", { ascending: false }),
    // [NEW] Fetch Guest Transactions
    supabase
      .from("view_guest_transactions")
      .select("*")
      .order("transaction_time", { ascending: false }),
  ]);

  return {
    groups: groupsRes.data || [],
    customers: customersRes.data || [],
    guestTransactions: guestRes.data || [], // [NEW] Return the data
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

  // 1. Extract and Sanitize Text Fields
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
  const date_of_registration = dateRegRaw || new Date().toISOString();

  const groupIdRaw = formData.get("group_id") as string;
  const group_id = groupIdRaw && groupIdRaw !== "" ? groupIdRaw : null;

  // 2. Handle File Uploads
  const files = formData.getAll("documents");
  const uploadedUrls: string[] = [];

  if (files.length > 0) {
    for (const fileEntry of files) {
      if (fileEntry instanceof File) {
        const file = fileEntry;

        // Create a clean file path: customers/{user_id}/{timestamp}_{safe_filename}
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `customers/${user.id}/${Date.now()}_${safeName}`;

        // Upload to Supabase Storage (Bucket: 'documents')
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          // Continue with other files even if one fails
          continue;
        }

        if (uploadData) {
          // Get Public URL for the uploaded file
          const {
            data: { publicUrl },
          } = supabase.storage.from("documents").getPublicUrl(uploadData.path);

          uploadedUrls.push(publicUrl);
        }
      }
    }
  }

  // 3. Insert Customer Record into Database
  return await supabase.from("customers").insert({
    full_name,
    phone_number,
    email,
    address,
    remarks,
    birthdate,
    date_of_registration,
    group_id,
    documents: uploadedUrls, // Save the array of public URLs
    store_id: user.user_metadata?.store_id, // Link to the user's store
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
