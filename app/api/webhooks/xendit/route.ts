import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // --- DEBUG LOGGING ---
    console.log("Xendit Webhook Received:", JSON.stringify(body, null, 2));
    // ---------------------

    // 1. Check Status (Accept PAID or SETTLED)
    if (body.status === "PAID" || body.status === "SETTLED") {
      // 2. Try to get Store ID from two places
      let storeId = body.meta?.store_id;
      const payerId = body.meta?.payer_user_id;

      // Backup: Extract from external_id (Format: "sub_STOREID_TIMESTAMP")
      if (!storeId && body.external_id) {
        console.log(
          "Metadata missing, attempting to parse external_id:",
          body.external_id
        );
        const parts = body.external_id.split("_");
        // Assuming format: sub_STOREID_TIMESTAMP
        if (parts.length >= 2) {
          storeId = parts[1];
        }
      }

      if (!storeId) {
        console.error("CRITICAL: Could not find store_id in webhook payload.");
        return NextResponse.json(
          { error: "Missing store_id" },
          { status: 400 }
        );
      }

      console.log(`Processing Subscription for Store: ${storeId}`);

      // 3. Calculate Dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30);

      // 4. Update Database
      const { data, error } = await supabaseAdmin
        .from("store_subscriptions")
        .upsert(
          {
            store_id: storeId,
            xendit_invoice_id: body.id,
            status: "PAID",
            amount_paid: body.amount,
            payer_user_id: payerId || null, // Okay if null, we just need the store active
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            updated_at: new Date(),
          },
          { onConflict: "store_id" }
        )
        .select();

      if (error) {
        console.error("Supabase Write Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("Database updated successfully:", data);
    } else {
      console.log("Ignored event status:", body.status);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Handler Failed:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
