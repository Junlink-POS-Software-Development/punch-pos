"use client";

import { useState, useEffect, useRef } from "react";

// ─── Infinite Scroll Hook ─────────────────────────────────────────────────────

interface UseInfiniteScrollOptions {
  /** Total number of items available */
  totalItems: number;
  /** Number of items to add each time the sentinel is intersected */
  increment?: number;
  /** IntersectionObserver threshold (0–1) */
  threshold?: number;
}

/**
 * Manages progressive rendering via IntersectionObserver.
 * Attach `loadMoreRef` to a sentinel element at the bottom of the list.
 */
export function useInfiniteScroll({
  totalItems,
  increment = 50,
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const [visibleCount, setVisibleCount] = useState(increment);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < totalItems) {
          setVisibleCount((prev) => prev + increment);
        }
      },
      { threshold }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, totalItems, increment, threshold]);

  return { visibleCount, loadMoreRef };
}
