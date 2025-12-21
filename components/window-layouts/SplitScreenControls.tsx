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

  const handleToggle = () => {
    // Toggle between 1 (Split) and 2 (Right Full)
    const newState = viewState === 1 ? 2 : 1;
    setViewState(newState);
    setIsSplit(newState === 1);
  };

  return (
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
                <span>Hide Terminal</span>
                <ArrowLeftIcon />
              </>
            ) : (
              <>
                <ArrowRightIcon />
                <span>View Terminal</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleToggle}
            className="flex justify-center items-center gap-2 bg-white/80 shadow-lg backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-blue-600 active:scale-95 transition-transform"
            aria-label="Toggle view"
          >
            {viewState === 1 ? (
              <>
                <span>Hide Terminal</span>
                <ArrowLeftIcon />
              </>
            ) : (
              <>
                <ArrowRightIcon />
                <span>Show Terminal</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
