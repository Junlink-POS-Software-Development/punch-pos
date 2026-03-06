"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserStores, switchActiveStore, getStoreInfo } from "@/app/actions/store";

interface StoreEntry {
  store_id: string;
  store_name: string;
  store_img: string | null;
  role: string;
}

export function useStoreSwitcher() {
  // ─── Local State ──────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["storeSwitcher"],
    queryFn: async () => {
      const [storesResult, storeInfoResult] = await Promise.all([
        getUserStores(),
        getStoreInfo(),
      ]);

      const stores: StoreEntry[] = storesResult.success ? (storesResult.stores || []) : [];

      let currentStoreId: string | null = null;
      if (storeInfoResult.success && storeInfoResult.storeName && stores.length > 0) {
        const current = stores.find(
          (s) => s.store_name === storeInfoResult.storeName
        );
        if (current) currentStoreId = current.store_id;
      }

      return { stores, currentStoreId };
    },
    staleTime: 1000 * 60,
  });

  const stores = data?.stores || [];
  const currentStoreId = data?.currentStoreId || null;
  const currentStore = stores.find((s) => s.store_id === currentStoreId);
  const otherStores = stores.filter((s) => s.store_id !== currentStoreId);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSwitch = async (targetStoreId: string) => {
    if (targetStoreId === currentStoreId || isSwitching) return;

    setIsSwitching(true);
    setError(null);
    setIsOpen(false);

    try {
      const result = await switchActiveStore(targetStoreId);

      if (!result.success) {
        setError(result.error || "Failed to switch store");
        setIsSwitching(false);
        return;
      }

      // Full reload to refresh JWT claims, permissions, and all store-dependent state
      window.location.reload();
    } catch (err) {
      console.error("Switch store error:", err);
      setError((err as Error).message);
      setIsSwitching(false);
    }
  };

  return {
    // Data
    stores,
    currentStore,
    otherStores,
    isLoading,

    // State
    isOpen,
    setIsOpen,
    isSwitching,
    error,

    // Handlers
    handleSwitch,
  };
}
