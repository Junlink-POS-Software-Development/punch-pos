"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // 1. Initial Load
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Auth Init Error:", error);
      } finally {
        setIsAuthReady(true);
      }
    };

    initAuth();

    // 2. Listen for standard auth changes (Login, Logout, Auto-Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        // Ensure we mark as ready if we somehow missed the init
        setIsAuthReady(true);
      }
    );

    // 3. Simple "Wake Up" Refresh
    // No complex detection. Just ensure session is valid when user returns.
    const handleFocus = async () => {
      if (document.visibilityState === 'visible') {
         // This automatically handles dead sockets by forcing a new handshake
         await supabase.auth.refreshSession(); 
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const value: AuthContextType = {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    isAuthReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}