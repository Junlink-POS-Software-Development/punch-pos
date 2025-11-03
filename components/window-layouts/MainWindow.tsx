// components/SplitScreenSlider.tsx
"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { SplitScreenControls } from "./SplitScreenControls";
import LeftWindow from "./LeftWindow";
import RightWindow from "./RightWindow";
import { useView } from "./ViewContext";

// STEP 1: Update the function to accept 'children'
export default function MainWindow({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileView, setMobileView] = useState<"left" | "right">("left");
  const [isInitial, setIsInitial] = useState(true);
  const { viewState } = useView();

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
