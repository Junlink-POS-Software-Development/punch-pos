// components/reusables/useOutsideClick.ts
"use client";

import { useEffect, useRef } from "react";

/**
 * A custom hook that triggers a callback when a click occurs outside of the referenced element.
 * @param callback The function to call when an outside click is detected.
 */
export const useOutsideClick = (callback: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [callback]);

  return ref;
};
