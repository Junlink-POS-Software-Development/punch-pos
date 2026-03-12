// Example custom hook to get auth state
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

export function useAuthSession() {
  // ✅ State should hold User | null
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const check = async () => {
      let isSuccess = false;
      let loggedInUser = null;

      // 1. Try hitting the server if online
      if (typeof navigator !== "undefined" && navigator.onLine) {
        try {
          const { checkSession } = await import("@/app/actions/auth");
          const result = await checkSession();
          if (result.success && result.user) {
            isSuccess = true;
            loggedInUser = result.user;
          }
        } catch (error) {
           console.warn("[AuthSession] Server checkSession failed, trying local fallback...");
        }
      }

      // 2. If server fetch failed or device is offline, check local browser cookie session
      if (!isSuccess) {
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            isSuccess = true;
            loggedInUser = session.user;
          }
        } catch (err) {
            console.error("[AuthSession] Local session fallback failed", err);
        }
      }

      if (isSuccess && loggedInUser) {
        setUser(loggedInUser as User);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    
    check();
    // We removed the real-time subscription. 
    // This hook is now a one-time check on mount.
  }, []);

  // Return the user and a simple boolean flag
  // We map 'session' to 'user' to keep some backward compatibility if needed, 
  // but ideally consumers should use 'user'.
  return { session: { user }, user, isAuthenticated };
}
