"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getStoreInfo, updateStoreBusinessMode, updateStoreInfo } from "@/app/actions/store";
import {
  BusinessMode,
  ModulesConfig,
  IndustryConfig,
  DEFAULT_MODULES_CONFIG,
  BUSINESS_MODE_PRESETS,
  BusinessModeInfo,
} from "@/lib/types/businessMode";

export function useBusinessMode() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["storeInfo", user?.id],
    queryFn: async () => {
      const result = await getStoreInfo();
      if (!result.success) {
        throw new Error(result.error || "Failed to load store business mode");
      }
      return result;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Listen to global window event for store updates
  useEffect(() => {
    const handleStoreUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["storeInfo", user?.id] });
    };
    window.addEventListener("store-updated", handleStoreUpdated);
    return () => window.removeEventListener("store-updated", handleStoreUpdated);
  }, [queryClient, user?.id]);

  const businessMode: BusinessMode = data?.businessMode || "retail";
  const modules: ModulesConfig = data?.modulesEnabled || DEFAULT_MODULES_CONFIG;
  const industryConfig: IndustryConfig = data?.industryConfig || {};
  const currentPreset: BusinessModeInfo = BUSINESS_MODE_PRESETS[businessMode] || BUSINESS_MODE_PRESETS.retail;

  const setBusinessMode = async (
    mode: BusinessMode,
    customModules?: Partial<ModulesConfig>,
    customIndustryConfig?: IndustryConfig
  ) => {
    const res = await updateStoreBusinessMode(
      mode,
      customModules,
      customIndustryConfig || industryConfig
    );
    if (res.success) {
      await queryClient.invalidateQueries({ queryKey: ["storeInfo", user?.id] });
      window.dispatchEvent(new Event("store-updated"));
    }
    return res;
  };

  const toggleModule = async (moduleKey: keyof ModulesConfig, enabled: boolean) => {
    const updatedModules: ModulesConfig = {
      ...modules,
      [moduleKey]: enabled,
    };
    const res = await updateStoreInfo({
      modulesEnabled: updatedModules,
    });
    if (res.success) {
      await queryClient.invalidateQueries({ queryKey: ["storeInfo", user?.id] });
      window.dispatchEvent(new Event("store-updated"));
    }
    return res;
  };

  return {
    businessMode,
    modules,
    industryConfig,
    currentPreset,
    isLoading,
    error,
    refetch,
    setBusinessMode,
    toggleModule,
    // Convenience helper flags
    isPharmacy: businessMode === "pharmacy" || modules.batch_expiry || modules.prescription_rx,
    isRestaurant: businessMode === "restaurant" || modules.table_management || modules.kitchen_display,
    isGrocery: businessMode === "grocery" || modules.weighed_items,
    isMall: businessMode === "mall" || modules.concessionaire_accounting,
    isService: businessMode === "service" || modules.staff_commission,
  };
}
