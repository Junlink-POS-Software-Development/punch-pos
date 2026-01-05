"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// 1. Fetcher for the Hook
export async function fetchSubscriptionData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("fetchSubscriptionData: Not authenticated");
    return { success: false, error: "Not authenticated" };
  }

  // UPDATED: Get Store ID directly from the 'users' table
  // This is the source of truth and avoids RLS recursion on the members table.
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (userError) {
    console.error("fetchSubscriptionData: Error fetching user data", userError);
    return { success: false, error: "Failed to fetch user data" };
  }

  if (!userData?.store_id) {
    console.error("fetchSubscriptionData: No store_id found on user record");
    return { success: false, error: "No store found" };
  }

  const storeId = userData.store_id;
  console.log("fetchSubscriptionData: Found store_id", storeId);

  // Get Subscription
  const { data: subscription, error: subError } = await supabase
    .from("store_subscriptions")
    .select("*")
    .eq("store_id", storeId)
    .maybeSingle();

  if (subError) {
    console.error("fetchSubscriptionData: Subscription query error", subError);
  }

  // Get Payments (Optional: returning the current subscription as a history item)
  const payments = subscription
    ? [
        {
          id: subscription.id,
          amount: subscription.amount_paid || 450,
          status: subscription.status,
          created_at: subscription.updated_at,
          transaction_id: subscription.xendit_invoice_id,
        },
      ]
    : [];

  return {
    success: true,
    storeId: storeId,
    subscription,
    payments,
  };
}


// 2. Xendit Payment Creator
export async function createXenditSubscription(storeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // FIX: Fetch from 'users' table instead of 'members'
  // This works for both Store Owners and Team Members
  const { data: userData, error } = await supabase
    .from("users")
    .select("email, store_id")
    .eq("user_id", user.id)
    .single();

  if (error || !userData) {
    console.error("User lookup failed:", error);
    throw new Error("User not found");
  }

  // Security Check: Ensure the user actually belongs to this store
  if (userData.store_id !== storeId) {
    throw new Error("Unauthorized: You do not belong to this store");
  }

  // Xendit Logic
  const externalId = `sub_${storeId}_${Date.now()}`;
  const authHeader = `Basic ${Buffer.from(
    process.env.XENDIT_SECRET_KEY + ":"
  ).toString("base64")}`;

  const payload = {
    external_id: externalId,
    amount: 500,
    payer_email: userData.email || "customer@example.com",
    description: `Monthly Subscription for Store (User: ${userData.email})`,
    invoice_duration: 86400,
    success_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?payment=success`,
    failure_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?payment=failure`,
    currency: "PHP",
    meta: {
      store_id: storeId,
      payer_user_id: user.id,
    },
  };

  const res = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const invoice = await res.json();

  if (!res.ok) {
    console.error("Xendit Error:", invoice);
    throw new Error("Failed to create payment invoice");
  }

  // Redirect to Xendit
  redirect(invoice.invoice_url);
}