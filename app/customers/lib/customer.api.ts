"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * ─── Customer API Fetchers ──────────────────────────────────────────────────
 */

export async function fetchCustomerFeatureData(
  startDate?: string,
  endDate?: string
) {
  const supabase = await createClient();

  // 1. Build the guest transactions query with optional date filters
  let guestQuery = supabase
    .from("view_guest_transactions")
    .select("*")
    .order("transaction_time", { ascending: false });

  // 2. Apply date filters if provided
  if (startDate) {
    guestQuery = guestQuery.gte("transaction_time", startDate);
  }
  if (endDate) {
    const endDateTime = new Date(endDate);
    endDateTime.setDate(endDateTime.getDate() + 1);
    guestQuery = guestQuery.lt("transaction_time", endDateTime.toISOString());
  }

  // 3. Execute concurrent queries
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
}

export async function fetchDashboardData() {
  const supabase = await createClient();

  // 1. Fetch groups and customers
  const [groupsRes, customersRes] = await Promise.all([
    supabase.from("customer_groups").select("*").order("name"),
    supabase
      .from("customers")
      .select("*, group:customer_groups(*)")
      .order("full_name", { ascending: true }),
  ]);

  return { 
    groups: groupsRes.data || [], 
    customers: customersRes.data || [] 
  };
}
