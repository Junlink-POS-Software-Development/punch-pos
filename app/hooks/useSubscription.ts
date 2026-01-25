"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["subscription-data"],
    queryFn: async () => {
      const { fetchSubscriptionData } = await import(
        "@/app/actions/subscription"
      );
      const result = await fetchSubscriptionData();
      console.log("fetchSubscriptionData result:", result);

      if (result.success) {
        return {
          storeId: result.storeId || null,
          subscription: result.subscription || null,
          payments: result.payments || [],
        };
      } else {
        console.error("fetchSubscriptionData failed:", result.error);
        return { storeId: null, subscription: null, payments: [] };
      }
    },
  });

  const subscription = data?.subscription || null;
  const payments = data?.payments || [];
  const storeId = data?.storeId || null;

  const subscribeAction = async () => {
    if (!storeId) {
      alert("Store ID not found. Please reload.");
      return;
    }

    try {
      // Import the Xendit Server Action
      const { createXenditSubscription } = await import(
        "@/app/actions/subscription"
      );

      // This will trigger a redirect to Xendit.
      // The code below this line won't execute if redirect happens successfully.
      await createXenditSubscription(storeId);
    } catch (error) {
      console.error("Subscription initiation failed:", error);
      alert("Failed to initialize payment. Please check console.");
    }
  };

  return { subscription, payments, loading, subscribe: subscribeAction };
}
