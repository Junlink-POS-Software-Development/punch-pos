// components/SplitScreenSlider.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMediaQuery } from "../../app/hooks/useMediaQuery";
import { SplitScreenControls } from "./SplitScreenControls";
import RightWindow from "./RightWindow";
import { useViewStore } from "./store/useViewStore";

import { WindowLoading } from "./WindowLoading";

// Dynamic import for LeftWindow (contains SalesTerminal) - improves INP
const LeftWindow = dynamic(() => import("./LeftWindow"), {
  loading: () => (
    <div 
      className="h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
      style={{ width: "50%" }}
    >
      <div className="box-border pt-4 pr-2 pb-4 pl-4 w-full h-full">
        <WindowLoading />
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { viewState } = useViewStore();

  const isMobile = useMediaQuery("(max-width: 1024px)");

  const handleToggleClick = () => {
    setMobileView((current) => (current === "left" ? "right" : "left"));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitial(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle transition state when view changes
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Match the duration-500 class

    return () => clearTimeout(timer);
  }, [viewState, mobileView]);

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
    if (viewState === 2) {
      leftWidth = "0%";
      rightWidth = "100%";
    }
  }

  return (
    <div className="relative flex bg-background w-full min-h-screen overflow-hidden">
      <LeftWindow leftWidth={leftWidth} isTransitioning={isTransitioning} />

      {/* STEP 2: Pass 'children' down to the RightWindow */}
      <RightWindow rightWidth={rightWidth} isTransitioning={isTransitioning}>{children}</RightWindow>

      <SplitScreenControls
        isMobile={isMobile}
        isInitial={isInitial}
        mobileView={mobileView}
        onToggleClick={handleToggleClick}
      />
    </div>
  );
}
