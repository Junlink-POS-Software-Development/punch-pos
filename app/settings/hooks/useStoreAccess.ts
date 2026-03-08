"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { decodeJwtPayload } from "@/lib/utils/jwt";
import {
  getEnrollmentCodeStatus,
  generateEnrollmentCode,
  joinStoreViaEnrollmentId,
} from "@/app/actions/store";

export function useStoreAccess() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // ─── Local State ──────────────────────────────────────────────────────────
  const [joinId, setJoinId] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [codeMessage, setCodeMessage] = useState("");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["storeAccess", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Fetch enrollment code status
      const codeResult = await getEnrollmentCodeStatus();

      // Decode role from JWT
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      let userRole = "owner";
      if (session?.access_token) {
        const decoded = decodeJwtPayload(session.access_token);
        userRole = decoded?.userrole || decoded?.app_metadata?.role || decoded?.role || "owner";
      }

      return {
        code: codeResult.success ? codeResult.code : null,
        expiresAt: codeResult.success ? codeResult.expiresAt : null,
        role: userRole,
      };
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  // ─── Countdown Timer ─────────────────────────────────────────────────────
  const calculateTimeRemaining = useCallback(() => {
    if (!data?.expiresAt) return "";
    const diff = new Date(data.expiresAt).getTime() - Date.now();
    if (diff <= 0) return "";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }, [data?.expiresAt]);

  useEffect(() => {
    if (!data?.expiresAt) {
      setTimeRemaining("");
      return;
    }

    setTimeRemaining(calculateTimeRemaining());
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      if (!remaining) {
        clearInterval(interval);
        queryClient.invalidateQueries({ queryKey: ["storeAccess"] });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.expiresAt, calculateTimeRemaining, queryClient]);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const generateCodeMutation = useMutation({
    mutationFn: () => generateEnrollmentCode(),
    onSuccess: (result) => {
      if (result.success) {
        setCodeMessage("Enrollment code generated successfully.");
        queryClient.invalidateQueries({ queryKey: ["storeAccess"] });
      } else {
        setCodeMessage("Failed to generate: " + result.error);
      }
    },
    onError: () => {
      setCodeMessage("An error occurred.");
    },
  });

  const joinStoreMutation = useMutation({
    mutationFn: (idToJoin: string) => joinStoreViaEnrollmentId(idToJoin),
    onSuccess: (result) => {
      if (result.success) {
        setJoinMessage("Successfully joined store! Refreshing...");
        window.location.reload();
      } else {
        setJoinMessage("Failed to join: " + result.error);
      }
    },
    onError: () => {
      setJoinMessage("An error occurred.");
    },
  });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleGenerateCode = () => {
    setCodeMessage("");
    generateCodeMutation.mutate();
  };

  const handleJoinStore = () => {
    if (!joinId.trim()) return;
    setJoinMessage("");
    joinStoreMutation.mutate(joinId);
  };

  return {
    // Data
    role: data?.role || "owner",
    isLoading,
    
    // Enrollment Code
    generatedCode: data?.code || null,
    timeRemaining,
    codeMessage,
    isGenerating: generateCodeMutation.isPending,
    
    // Join Store
    joinId,
    setJoinId,
    joinMessage,
    isJoining: joinStoreMutation.isPending,
    
    // Exit
    isExitModalOpen,
    setIsExitModalOpen,
    
    // Handlers
    handleGenerateCode,
    handleJoinStore,
  };
}
