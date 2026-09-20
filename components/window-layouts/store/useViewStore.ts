import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Extensible POS mode type — add future modes here (e.g., 'kiosk', 'drive-thru')
export type PosMode = 'desktop' | 'tablet';

const POS_MODES: PosMode[] = ['desktop', 'tablet'];

interface ViewState {
  viewState: number;
  isSplit: boolean;
  posMode: PosMode;
  isFullscreen: boolean;
  autoFullscreenEnabled: boolean;
  autoFullscreenMinutes: number;
  lastSidebarInteraction: number;
  setPosMode: (mode: PosMode) => void;
  cyclePosMode: () => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  toggleFullscreen: () => void;
  setAutoFullscreenEnabled: (enabled: boolean) => void;
  setAutoFullscreenMinutes: (minutes: number) => void;
  recordSidebarInteraction: () => void;
  setViewState: (viewState: number | ((prev: number) => number)) => void;
  setIsSplit: (isSplit: boolean | ((prev: boolean) => boolean)) => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewState: 1,
      isSplit: true,
      posMode: 'desktop',
      isFullscreen: false,
      autoFullscreenEnabled: true,
      autoFullscreenMinutes: 2, // 2 minutes default
      lastSidebarInteraction: Date.now(),
      setPosMode: (mode) => set({ posMode: mode }),
      cyclePosMode: () =>
        set((state) => {
          const currentIndex = POS_MODES.indexOf(state.posMode);
          const nextIndex = (currentIndex + 1) % POS_MODES.length;
          return { posMode: POS_MODES[nextIndex] };
        }),
      setIsFullscreen: (isFullscreen) =>
        set((state) => ({
          isFullscreen,
          // When exiting fullscreen, reset the sidebar interaction timer so it doesn't immediately re-fullscreen
          lastSidebarInteraction: !isFullscreen ? Date.now() : state.lastSidebarInteraction,
        })),
      toggleFullscreen: () =>
        set((state) => {
          const next = !state.isFullscreen;
          return {
            isFullscreen: next,
            lastSidebarInteraction: !next ? Date.now() : state.lastSidebarInteraction,
          };
        }),
      setAutoFullscreenEnabled: (enabled) => set({ autoFullscreenEnabled: enabled }),
      setAutoFullscreenMinutes: (minutes) => set({ autoFullscreenMinutes: minutes }),
      recordSidebarInteraction: () => set({ lastSidebarInteraction: Date.now() }),
      setViewState: (viewState) =>
        set((state) => ({
          viewState: typeof viewState === 'function' ? viewState(state.viewState) : viewState,
        })),
      setIsSplit: (isSplit) =>
        set((state) => ({
          isSplit: typeof isSplit === 'function' ? isSplit(state.isSplit) : isSplit,
        })),
    }),
    {
      name: 'pos-view-mode-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        posMode: state.posMode,
        autoFullscreenEnabled: state.autoFullscreenEnabled,
        autoFullscreenMinutes: state.autoFullscreenMinutes,
      }),
    }
  )
);
