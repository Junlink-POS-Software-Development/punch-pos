"use client";

import { useEffect } from "react";
import { checkSession } from "@/app/actions/auth";

export default function SessionMonitor() {
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
      
        
        const startTime = performance.now();

        try {
          // Check session using Server Action
          const result = await checkSession();

          const duration = (performance.now() - startTime).toFixed(2);
         
          if (!result.success) {
            console.warn(`⚠️ [Monitor] Session invalid or expired (Time: ${duration}ms). Refreshing...`);
            // We can't refresh from client side without createClient. 
            // If session is dead, we might need to redirect or let the next server action fail and redirect.
            // For now, we just log it. The next action will handle the redirect.
            window.location.reload(); // Simplest recovery: reload to trigger middleware/server checks
          } 

        } catch (err: any) {
          const duration = (performance.now() - startTime).toFixed(2);
          console.error(`❌ [Monitor] Unexpected error after ${duration}ms:`, err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}