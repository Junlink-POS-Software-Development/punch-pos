"use client";

import React from "react";
import { useViewStore } from "./store/useViewStore";

// --- Prop Types ---
type ControlsProps = {
  isMobile: boolean;
  isInitial: boolean;
  mobileView: "left" | "right";
  onToggleClick: () => void;
};

// --- Icon Components ---
const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

// --- Control Component ---
export function SplitScreenControls({
  isMobile,
  isInitial,
  mobileView,
  onToggleClick,
}: ControlsProps) {
  const { viewState, setViewState, setIsSplit } = useViewStore();

  // 1. onChange handler: Only updates the slider's visual state.
  // This is a fast operation.
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = Number(e.target.value);
    setViewState(numericValue);
  };

  // 2. onMouseUp/onTouchEnd handler: Triggers the expensive layout change ONCE.
  // This fires when the user lets go of the slider.
  const handleSliderRelease = () => {
    // We can use the viewState directly since it was updated by onChange
    if (viewState !== 1) {
      setIsSplit(false);
    } else {
      setIsSplit(true);
    }
  };

  return (
    // We add `will-change-transform` here to hint to the browser
    // This element should be optimized, preventing layout shift.
    <div className="group bottom-0 left-1/2 z-10 absolute flex justify-center items-center w-72 h-20 -translate-x-1/2 will-change-transform">
      <div
        className={`
          transition-opacity duration-300 ease-in-out
          ${isInitial ? "opacity-100" : "opacity-0"}
          group-hover:opacity-100
        `}
      >
        {isMobile ? (
          <button
            onClick={onToggleClick}
            className="flex justify-center items-center gap-2 bg-white/80 shadow-lg backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-blue-600 active:scale-95 transition-transform"
            aria-label="Toggle view"
          >
            {mobileView === "left" ? (
              <>
                <span>View Right</span>
                <ArrowRightIcon />
              </>
            ) : (
              <>
                <ArrowLeftIcon />
                <span>View Left</span>
              </>
            )}
          </button>
        ) : (
          // This div with backdrop-blur is the source of the presentation delay.
          // Adding will-change-transform tells the browser to promote it
          // to its own layer, isolating it from child (input) updates.
          <div className="bg-white/80 shadow-lg backdrop-blur-sm p-2 px-4 rounded-full will-change-transform">
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={viewState}
              onChange={handleSliderChange} // 3. Fast update
              onMouseUp={handleSliderRelease} // 4. Expensive update on release
              onTouchEnd={handleSliderRelease} // 5. Expensive update on release
              className="bg-gray-300 rounded-lg w-52 h-2 accent-blue-600 appearance-none cursor-pointer"
              aria-label="View switcher"
            />
          </div>
        )}
      </div>
    </div>
  );
}
