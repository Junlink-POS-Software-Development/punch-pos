"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthInit({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  
  useEffect(() => {
    // 1. Run initial auth check
    initializeAuth();

    // 2. Add listener for when the tab becomes active again
    const handleFocus = async () => {
      const { checkSession } = await import("@/app/actions/auth");
      
      // Force a session refresh check
      const result = await checkSession();
      
      if (!result.success) {
        console.log("Session invalid on resume, attempting refresh...");
        window.location.reload();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [initializeAuth]);

  return <>{children}</>;
}