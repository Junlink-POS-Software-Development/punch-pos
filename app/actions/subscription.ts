"use server";

import { createClient } from "@/utils/supabase/server";
import dayjs from "dayjs";

export async function fetchSubscriptionData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "No user found" };
  }

  const { data: memberData, error: memberError } = await supabase
    .from("members")
    .select("store_id")
    .eq("user_id", user.id)
    .single();

  if (memberError || !memberData) {
    return { success: false, error: "No member data found" };
  }

  // Fetch Subscription
  const { data: subData, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('store_id', memberData.store_id)
    .maybeSingle();

  if (subError) {
    console.error("Error fetching subscription:", subError);
  }

  // Fetch Payments
  const { data: payData, error: payError } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('store_id', memberData.store_id)
    .order('created_at', { ascending: false });

  if (payError) {
    console.error("Error fetching payments:", payError);
  }

  return { 
    success: true, 
    storeId: memberData.store_id,
    subscription: subData, 
    payments: payData || [] 
  };
}

export async function subscribe(storeId: string) {
  const supabase = await createClient();

  const startDate = dayjs().toISOString();
  const endDate = dayjs().add(30, 'day').toISOString();

  // Create or Update Subscription
  const { data: subData, error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      store_id: storeId,
      status: 'active',
      current_period_start: startDate,
      current_period_end: endDate,
      updated_at: new Date().toISOString()
    }, { onConflict: 'store_id' })
    .select()
    .single();

  if (subError) {
    return { success: false, error: `Failed to create subscription: ${subError.message}` };
  }

  if (!subData) {
    return { success: false, error: "No subscription data returned from database" };
  }

  // Record Payment
  const { error: payError } = await supabase
    .from('subscription_payments')
    .insert({
      subscription_id: subData.id,
      store_id: storeId,
      amount: 450.00,
      currency: 'PHP',
      status: 'succeeded',
      payment_method: 'mock_card',
      transaction_id: `txn_${Date.now()}`
    });

  if (payError) {
    return { success: false, error: `Failed to record payment: ${payError.message}` };
  }

  return { success: true };
}
