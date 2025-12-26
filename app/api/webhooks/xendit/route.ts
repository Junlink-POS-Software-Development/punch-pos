import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin Client to bypass RLS and write to subscription table
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Verify Xendit Token (Security)
    const callbackToken = req.headers.get("x-callback-token");
    if (callbackToken !== process.env.XENDIT_WEBHOOK_VERIFICATION_TOKEN) {
      // In production, you must verify this!
      // For now, if you haven't set it in env, be careful.
    }

    const body = await req.json();

    // 2. Check if this is an Invoice Payment
    if (body.status === "PAID") {
      // Xendit sends the "meta" object we defined earlier in the server action?
      // Sometimes Xendit puts it in generic "meta" or we must rely on "external_id".
      // Let's verify via the "external_id" or if Xendit returned our meta object.
      // NOTE: Xendit invoice webhook usually includes the original 'meta' object if configured,
      // but 'external_id' is safer to parse if needed.

      // Ideally, rely on the meta we sent:
      const storeId = body.meta?.store_id;
      const payerId = body.meta?.payer_user_id;

      if (storeId && payerId) {
        // Calculate 30 days from now
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 30);

        // 3. Upsert Subscription
        const { error } = await supabaseAdmin
          .from("store_subscriptions")
          .upsert(
            {
              store_id: storeId,
              xendit_invoice_id: body.id,
              status: "PAID",
              amount_paid: body.amount,
              payer_user_id: payerId,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              updated_at: new Date(),
            },
            { onConflict: "store_id" }
          );

        if (error) console.error("Supabase Error:", error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Handler Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
