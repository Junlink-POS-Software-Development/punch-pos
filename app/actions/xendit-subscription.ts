"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createXenditSubscription(storeId: string) {
  const supabase = await createClient();

  // 1. Authenticate User
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 2. Verify Member belongs to Store
  const { data: member } = await supabase
    .from("members")
    .select("store_id, email")
    .eq("user_id", user.id)
    .eq("store_id", storeId)
    .single();

  if (!member) throw new Error("Unauthorized access to this store");

  // 3. Generate a unique external ID for Xendit
  // Format: "sub_STOREID_TIMESTAMP"
  const externalId = `sub_${storeId}_${Date.now()}`;

  // 4. Create Xendit Invoice
  // We use standard fetch. Xendit uses Basic Auth with the Secret Key as the username.
  const authHeader = `Basic ${Buffer.from(
    process.env.XENDIT_SECRET_KEY + ":"
  ).toString("base64")}`;

  const payload = {
    external_id: externalId,
    amount: 500, // 500 PHP (Xendit uses whole numbers for PHP usually, unlike Stripe cents)
    payer_email: member.email || "customer@example.com",
    description: `Monthly Subscription for Store`,
    invoice_duration: 86400, // Page active for 24 hours
    success_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?status=success`,
    failure_redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?status=failure`,
    currency: "PHP",
    // CRITICAL: Metadata to help the Webhook know which store this is for
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

  // 5. Redirect user to Xendit's Hosted Checkout Page (GCash/Maya/Card)
  redirect(invoice.invoice_url);
}
