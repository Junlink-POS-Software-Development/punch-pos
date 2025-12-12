"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";

export function AuthInit({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  
  // We expose a manual check function from the store or just use the client directly here
  // to keep it simple, we'll trigger a session check.
  
  useEffect(() => {
    // 1. Run initial auth check
    initializeAuth();

    // 2. Add listener for when the tab becomes active again
    const handleFocus = async () => {
      const supabase = createClient();
      
      // Force a session refresh check
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // If session is dead, we might want to sign out or just let the store update naturally
        console.log("Session invalid on resume, attempting refresh...");
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