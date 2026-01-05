"use client";

import { useState, useEffect } from "react";

export interface Subscription {
  id: string;
  store_id: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "active"; // Added 'active' just in case legacy
  amount_paid: number;
  start_date: string;
  end_date: string; // Changed from current_period_end to match Supabase schema
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  transaction_id: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // We import the fetcher server action
      const { fetchSubscriptionData } = await import(
        "@/app/actions/subscription"
      );
      const result = await fetchSubscriptionData();
      console.log("fetchSubscriptionData result:", result);

      if (result.success) {
        setStoreId(result.storeId || null);

        setSubscription(result.subscription || null);
        setPayments(result.payments || []);
      } else {
        console.error("fetchSubscriptionData failed:", result.error);
      }
    } catch (error) {
      console.error("Error in fetchSubscriptionData:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeAction = async () => {
    if (!storeId) {
      alert("Store ID not found. Please reload.");
      return;
    }

    try {
      setLoading(true);

      // Import the Xendit Server Action
      const { createXenditSubscription } = await import(
        "@/app/actions/subscription"
      );

      // This will trigger a redirect to Xendit.
      // The code below this line won't execute if redirect happens successfully.
      await createXenditSubscription(storeId);
    } catch (error) {
      console.error("Subscription initiation failed:", error);
      setLoading(false);
      alert("Failed to initialize payment. Please check console.");
    }
  };

  return { subscription, payments, loading, subscribe: subscribeAction };
}
