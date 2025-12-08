import { create } from 'zustand';

interface ViewState {
  viewState: number;
  isSplit: boolean;
  setViewState: (viewState: number | ((prev: number) => number)) => void;
  setIsSplit: (isSplit: boolean | ((prev: boolean) => boolean)) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  viewState: 1,
  isSplit: true,
  setViewState: (viewState) =>
    set((state) => ({
      viewState: typeof viewState === 'function' ? viewState(state.viewState) : viewState,
    })),
  setIsSplit: (isSplit) =>
    set((state) => ({
      isSplit: typeof isSplit === 'function' ? isSplit(state.isSplit) : isSplit,
    })),
}));
