"use client";

import { useState, useEffect } from 'react';

export interface Subscription {
  id: string;
  store_id: string;
  status: 'active' | 'inactive' | 'past_due';
  current_period_start: string;
  current_period_end: string;
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
      const { fetchSubscriptionData } = await import("@/app/actions/subscription");
      const result = await fetchSubscriptionData();
      
      if (result.success) {
        setStoreId(result.storeId || null);
        setSubscription(result.subscription || null);
        setPayments(result.payments || []);
      }
    } catch (error) {
      console.error("Error in fetchSubscriptionData:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeAction = async (): Promise<{ success: boolean; error?: string }> => {
    if (!storeId) {
      return { success: false, error: "Store ID not found. Please make sure you're logged in." };
    }

    try {
      setLoading(true);
      
      // Mock Payment Delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { subscribe } = await import("@/app/actions/subscription");
      const result = await subscribe(storeId);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Refresh data
      await fetchData();
      return { success: true };

    } catch (error) {
      console.error("Subscription failed:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unknown error occurred. Please check the console for details.";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { subscription, payments, loading, subscribe: subscribeAction };
}
