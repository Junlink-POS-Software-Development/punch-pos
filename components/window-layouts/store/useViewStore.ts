import { create } from 'zustand';

interface ViewState {
  viewState: number;
  isSplit: boolean;
  mobileView: "left" | "right";
  setViewState: (viewState: number | ((prev: number) => number)) => void;
  setIsSplit: (isSplit: boolean | ((prev: boolean) => boolean)) => void;
  setMobileView: (view: "left" | "right") => void;
}

export const useViewStore = create<ViewState>((set) => ({
  viewState: 1,
  isSplit: true,
  mobileView: "left",
  setViewState: (viewState) =>
    set((state) => ({
      viewState: typeof viewState === 'function' ? viewState(state.viewState) : viewState,
    })),
  setIsSplit: (isSplit) =>
    set((state) => ({
      isSplit: typeof isSplit === 'function' ? isSplit(state.isSplit) : isSplit,
    })),
  setMobileView: (view) => set({ mobileView: view }),
}));
