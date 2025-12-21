import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getUserProfile } from '@/app/actions/user';
import { checkSession } from '@/app/actions/auth';

interface UserState {
  userName: string;
  initializeUser: () => Promise<void>;
  setUserName: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Default is neutral. The persist middleware will overwrite this 
      // with the cached name ("JOHN DOE") almost instantly on mount.
      userName: "...", 

      setUserName: (name) => set({ userName: name }),

      initializeUser: async () => {
        // 1. We don't need to manually read localStorage here anymore.
        // The 'persist' middleware has already loaded the old name into 'userName'.

        try {
          // 2. Fetch fresh data in the background
          const sessionResult = await checkSession();

          if (sessionResult.success && sessionResult.user) {
            const profileResult = await getUserProfile(sessionResult.user.id);

            if (profileResult.success && profileResult.data) {
              const freshName = `${profileResult.data.first_name} ${profileResult.data.last_name}`.toUpperCase();
              
              // Only update if it changed to avoid unnecessary renders
              if (get().userName !== freshName) {
                set({ userName: freshName });
              }
              return;
            }
          }

          // 3. ONLY if the server explicitly denies us (logged out),
          // do we overwrite the cache with "PLEASE SIGN IN".
          set({ userName: "PLEASE SIGN IN" });

        } catch (error) {
          console.error("Failed to refresh user:", error);
          // Keep the cached name if it was a network error, 
          // or set to sign in if critical.
          if (get().userName === "...") {
             set({ userName: "PLEASE SIGN IN" });
          }
        }
      },
    }),
    {
      name: 'pos-user-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      
      // Optional: Only persist the userName, not functions
      partialize: (state) => ({ userName: state.userName }),
    }
  )
);