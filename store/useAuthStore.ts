import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthReady: false,

  initializeAuth: async () => {
    // Prevent multiple initializations if already ready
    if (get().isAuthReady) return;

    try {
      let isSuccess = false;
      let loggedInUser = null;

      // 1. Try hitting the server if online
      if (typeof navigator !== "undefined" && navigator.onLine) {
        try {
          const { checkSession } = await import('@/app/actions/auth');
          const result = await checkSession();
          
          if (result.success && result.user) {
            isSuccess = true;
            loggedInUser = result.user;
          }
        } catch (err) {
          console.warn('[Auth] Server checkSession failed, trying local fallback...', err);
        }
      }

      // 2. If server fetch failed or device is offline, check local browser cookie session
      if (!isSuccess) {
        console.log('[Auth] Using offline/local session fallback.');
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          isSuccess = true;
          loggedInUser = session.user;
          // Decode JWT payload for app_metadata if you need permissions to map identically here
          // We can just rely on the existing permissions token hook to parse it later.
        }
      }

      set({ user: loggedInUser as User, isAuthenticated: isSuccess });
    } catch (error) {
      console.error('Auth Init Error:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isAuthReady: true });
    }

    // We removed the real-time auth listener since we can't use createClient.
    // The SessionMonitor component will handle tab focus checks.
  },

  signOut: async () => {
    try {
      const { logout } = await import('@/app/actions/auth');
      await logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
}));
