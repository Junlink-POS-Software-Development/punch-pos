"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// 1. Fetcher for the Hook
export async function fetchSubscriptionData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Get Store
  const { data: member } = await supabase
    .from("members")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (!member) return { success: false, error: "No store found" };

  // Get Subscription
  const { data: subscription } = await supabase
    .from("store_subscriptions")
    .select("*")
    .eq("store_id", member.store_id)
    .single();

  // Get Payments (Optional: you might need a separate table or query based on invoice IDs if you save them)
  // For now, let's just return the current subscription as a "payment" history item if it exists
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
    storeId: member.store_id,
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

  // Verify Member
  const { data: member } = await supabase
    .from("members")
    .select("email")
    .eq("user_id", user.id)
    .eq("store_id", storeId)
    .single();

  if (!member) throw new Error("Unauthorized");

  // Xendit Logic
  const externalId = `sub_${storeId}_${Date.now()}`;
  const authHeader = `Basic ${Buffer.from(
    process.env.XENDIT_SECRET_KEY + ":"
  ).toString("base64")}`;

  const payload = {
    external_id: externalId,
    amount: 450,
    payer_email: member.email || "customer@example.com",
    description: `Monthly Subscription for Store (User: ${user.email})`,
    invoice_duration: 86400,
    success_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?payment=success`,
    failure_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?payment=failure`,
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
