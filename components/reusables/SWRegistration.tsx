"use client";

import { useEffect } from "react";

export function SWRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") return;

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration.scope);
        })
        .catch((error) => {
          console.error("SW registration failed: ", error);
        });
    }
  }, []);

  return null;
}
