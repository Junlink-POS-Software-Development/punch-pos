// components/SplitScreenSlider.tsx
"use client";

// We now import 'useSyncExternalStore' and keep 'useState' and 'useEffect'
// for the component's own logic.
import { useState, useEffect, useSyncExternalStore } from "react";

// --- useMediaQuery Hook (NEW IMPLEMENTATION) ---
// This new version uses 'useSyncExternalStore' to safely subscribe
// to the 'window.matchMedia' external store.
// This is the recommended way to handle this and should fix all linting errors.
function useMediaQuery(query: string): boolean {
  // getServerSnapshot: For SSR, we default to 'false' (desktop).
  const getServerSnapshot = (): boolean => {
    return false;
  };

  // getSnapshot: Gets the current value from the browser.
  const getSnapshot = (): boolean => {
    // 'window' is only available on the client.
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  // subscribe: Subscribes to changes.
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      // Don't subscribe on the server
      return () => {};
    }

    const media = window.matchMedia(query);

    // The callback from React will trigger a re-render
    media.addEventListener("change", callback);

    // Return the unsubscribe function
    return () => {
      media.removeEventListener("change", callback);
    };
  };

  // useSyncExternalStore handles the rest:
  // - It will use getServerSnapshot on the server.
  // - It will use getSnapshot on the client for the initial render (hydration).
  // - It will subscribe to changes and update the component.
  const matches = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return matches;
}

export default function SplitScreenSlider() {
  // --- State ---

  // State for desktop 3-way slider (0=left, 1=split, 2=right)
  const [viewState, setViewState] = useState(1);
  // State for mobile 2-way toggle ('left' or 'right')
  const [mobileView, setMobileView] = useState<"left" | "right">("left");
  // State for initial control visibility (fades out after 3s)
  const [isInitial, setIsInitial] = useState(true);

  // --- Media Query ---
  // We check for screens 768px or less (Tailwind's 'md' breakpoint)
  // This hook now uses the new, stable implementation.
  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- Event Handlers ---

  /** Handles the desktop slider change */
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewState(Number(e.target.value));
  };

  /** Handles the mobile toggle button click */
  const handleToggleClick = () => {
    // Simply flips the state between 'left' and 'right'
    setMobileView((current) => (current === "left" ? "right" : "left"));
  };

  // --- Visibility Timer Effect ---
  // This effect (which is perfectly fine) runs once on mount
  // to hide the control after 3s.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitial(false); // Hide control
    }, 3000);

    // Cleanup timer if component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty array ensures this runs only once

  // --- Dynamic Styles ---
  // We calculate the widths based on whether we're in
  // mobile or desktop view.
  let leftWidth = "50%";
  let rightWidth = "50%";

  if (isMobile) {
    // --- Mobile Logic ---
    if (mobileView === "left") {
      leftWidth = "100%";
      rightWidth = "0%";
    } else {
      // mobileView === 'right'
      leftWidth = "0%";
      rightWidth = "100%";
    }
  } else {
    // --- Desktop Logic (same as before) ---
    if (viewState === 0) {
      // Left full
      leftWidth = "100%";
      rightWidth = "0%";
    } else if (viewState === 2) {
      // Right full
      leftWidth = "0%";
      rightWidth = "100%";
    }
    // if viewState is 1, the 50%/50% default is used
  }

  return (
    // Main container: relative, full-screen, flex, and overflow hidden
    <div className="relative flex bg-gray-100 w-full min-h-screen overflow-hidden">
      {/* Left Window */}
      <div
        className="bg-blue-50 h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
        style={{ width: leftWidth }}
      >
        <div className="p-8 whitespace-nowrap">
          <h2 className="font-bold text-blue-900 text-2xl">Left Window</h2>
          <p className="text-blue-800">
            This is the content for the left pane.
          </p>
        </div>
      </div>

      {/* Right Window */}
      <div
        className="bg-orange-50 h-screen overflow-hidden transition-all duration-500 ease-in-out shrink-0"
        style={{ width: rightWidth }}
      >
        <div className="p-8 whitespace-nowrap">
          <h2 className="font-bold text-orange-900 text-2xl">Right Window</h2>
          <p className="text-orange-800">
            This is the content for the right pane.
          </p>
        </div>
      </div>

      {/* This is the large, invisible hover *target* area.
        - 'group' allows children to react to its hover state.
      */}
      <div className="group bottom-0 left-1/2 z-10 absolute flex justify-center items-center w-72 h-20 -translate-x-1/2">
        {/* This div handles the fade in/out animation.
          - It fades out after 3s (isInitial becomes false)
          - It fades back in when the parent 'group' is hovered.
        */}
        <div
          className={`
            transition-opacity duration-300 ease-in-out
            ${isInitial ? "opacity-100" : "opacity-0"}
            group-hover:opacity-100
          `}
        >
          {/* Here is the conditional rendering!
            - If 'isMobile' is true, show the button.
            - Otherwise, show the slider.
          */}
          {isMobile ? (
            // --- Mobile Toggle Button ---
            <button
              onClick={handleToggleClick}
              className="flex justify-center items-center gap-2 bg-white/80 shadow-lg backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-blue-600 active:scale-95 transition-transform"
              aria-label="Toggle view"
            >
              {mobileView === "left" ? (
                // If "left" is active, show button to go "right"
                <>
                  <span>View Right</span>
                  {/* Right Arrow SVG Icon */}
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
                </>
              ) : (
                // If "right" is active, show button to go "left"
                <>
                  {/* Left Arrow SVG Icon */}
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
                  <span>View Left</span>
                </>
              )}
            </button>
          ) : (
            // --- Desktop 3-Way Slider ---
            <div className="bg-white/80 shadow-lg backdrop-blur-sm p-2 px-4 rounded-full">
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={viewState}
                onChange={handleSliderChange}
                className="bg-gray-300 rounded-lg w-52 h-2 accent-blue-600 appearance-none cursor-pointer"
                aria-label="View switcher"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
