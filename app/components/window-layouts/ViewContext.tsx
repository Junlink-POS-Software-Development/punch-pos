"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface ViewContextType {
  viewState: number;
  setViewState: Dispatch<SetStateAction<number>>;
  isSplit: boolean;
  setIsSplit: Dispatch<SetStateAction<boolean>>;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewState, setViewState] = useState(1);
  const [isSplit, setIsSplit] = useState(true);

  const value = { viewState, setViewState, isSplit, setIsSplit };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
