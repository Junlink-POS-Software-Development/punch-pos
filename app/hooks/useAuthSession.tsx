// Example custom hook to get auth state
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

export function useAuthSession() {
  // ✅ State should hold User | null
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { checkSession } = await import("@/app/actions/auth");
      const result = await checkSession();
      if (result.success && result.user) {
        setUser(result.user as User);
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
