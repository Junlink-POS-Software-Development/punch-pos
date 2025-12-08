import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  isAuthReady: false,

  initializeAuth: async () => {
    // Prevent multiple initializations if already ready? 
    // Actually, we might want to re-init if needed, but usually once per app load.
    if (get().isAuthReady) return;

    const supabase = createClient();

    try {
      // 1. Initial Load
      // Use getUser() for security
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        set({ session, user, isAuthenticated: !!session });
      } else {
        set({ session: null, user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth Init Error:', error);
    } finally {
      set({ isAuthReady: true });
    }

    // 2. Listen for auth changes
    // We need to store the subscription cleanup somewhere if we want to unsubscribe.
    // But for a global store initialized once, we might not need to unsubscribe until app unmount (which happens on refresh).
    // However, strictly speaking, we should handle it. 
    // But Zustand stores don't have a natural "unmount" lifecycle.
    // We can just set up the listener.
    supabase.auth.onAuthStateChange((_event, newSession) => {
      set({ 
        session: newSession, 
        user: newSession?.user || null, 
        isAuthenticated: !!newSession, 
        isAuthReady: true 
      });
    });
  },

  signOut: async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      set({ session: null, user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
}));
