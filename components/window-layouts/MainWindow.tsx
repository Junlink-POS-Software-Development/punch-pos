// components/SplitScreenSlider.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "../../app/hooks/useMediaQuery";
import { SplitScreenControls } from "./SplitScreenControls";
import RightWindow from "./RightWindow";
import { useViewStore } from "./store/useViewStore";

// Dynamic import for LeftWindow (contains SalesTerminal) - improves INP
const LeftWindow = dynamic(() => import("./LeftWindow"), {
  loading: () => (
    <div 
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: "50%" }}
    >
      <div className="box-border pt-4 pr-2 pb-4 pl-4 w-full h-full">
        <div className="p-8 w-full h-full glass-effect flex flex-col items-center justify-center gap-6">
          {/* Animated spinner with glassmorphic effect */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          </div>
          
          {/* Loading text with subtle animation */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-300 text-lg font-medium">Loading Terminal</p>
            <p className="text-slate-500 text-sm">Preparing your workspace...</p>
          </div>
          
          {/* Skeleton preview of terminal layout */}
          <div className="w-full max-w-2xl space-y-4 mt-8">
            <div className="h-12 bg-slate-800/50 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-slate-800/50 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-slate-800/50 rounded-lg animate-pulse"></div>
              <div className="h-24 bg-slate-800/50 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

// STEP 1: Update the function to accept 'children'
export default function MainWindow({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileView, setMobileView] = useState<"left" | "right">("left");
  const [isInitial, setIsInitial] = useState(true);
  const { viewState } = useViewStore();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleToggleClick = () => {
    setMobileView((current) => (current === "left" ? "right" : "left"));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitial(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  let leftWidth = "50%";
  let rightWidth = "50%";

  if (isMobile) {
    if (mobileView === "left") {
      leftWidth = "100%";
      rightWidth = "0%";
    } else {
      leftWidth = "0%";
      rightWidth = "100%";
    }
  } else {
    if (viewState === 0) {
      leftWidth = "100%";
      rightWidth = "0%";
    } else if (viewState === 2) {
      leftWidth = "0%";
      rightWidth = "100%";
    }
  }

  return (
    <div className="relative flex bg-background w-full min-h-screen overflow-hidden">
      <LeftWindow leftWidth={leftWidth} />

      {/* STEP 2: Pass 'children' down to the RightWindow */}
      <RightWindow rightWidth={rightWidth}>{children}</RightWindow>

      <SplitScreenControls
        isMobile={isMobile}
        isInitial={isInitial}
        mobileView={mobileView}
        onToggleClick={handleToggleClick}
      />
    </div>
  );
}
