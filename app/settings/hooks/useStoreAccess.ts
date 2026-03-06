"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { decodeJwtPayload } from "@/lib/utils/jwt";
import {
  getStoreEnrollmentId,
  updateStoreEnrollmentId,
  joinStoreViaEnrollmentId,
} from "@/app/actions/store";

export function useStoreAccess() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // ─── Local State ──────────────────────────────────────────────────────────
  const [enrollmentId, setEnrollmentId] = useState("");
  const [joinId, setJoinId] = useState("");
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ["storeAccess", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const result = await getStoreEnrollmentId();
      if (result.success && result.enrollmentId) {
        setEnrollmentId(result.enrollmentId);
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      let userRole = "owner";
      if (session?.access_token) {
        const decoded = decodeJwtPayload(session.access_token);
        userRole = decoded?.userrole || decoded?.app_metadata?.role || decoded?.role || "owner";
      }

      return {
        enrollmentId: result.success ? result.enrollmentId : null,
        role: userRole,
      };
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const updateEnrollmentMutation = useMutation({
    mutationFn: (newId: string) => updateStoreEnrollmentId(newId),
    onSuccess: (result) => {
      if (result.success) {
        setEnrollmentMessage("Enrollment ID updated successfully.");
        queryClient.invalidateQueries({ queryKey: ["storeAccess"] });
      } else {
        setEnrollmentMessage("Failed to update: " + result.error);
      }
    },
    onError: () => {
      setEnrollmentMessage("An error occurred.");
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
  const handleUpdateEnrollment = () => {
    setEnrollmentMessage("");
    updateEnrollmentMutation.mutate(enrollmentId);
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
    
    // State
    enrollmentId,
    setEnrollmentId,
    joinId,
    setJoinId,
    isExitModalOpen,
    setIsExitModalOpen,
    
    // Messages
    enrollmentMessage,
    joinMessage,
    
    // Status
    isSaving: updateEnrollmentMutation.isPending,
    isJoining: joinStoreMutation.isPending,
    
    // Handlers
    handleUpdateEnrollment,
    handleJoinStore,
  };
}
