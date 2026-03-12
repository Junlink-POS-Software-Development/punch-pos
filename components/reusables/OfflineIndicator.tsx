"use client";

import { useState, useEffect } from "react";
import { useOfflineQueueStore } from "@/store/useOfflineQueueStore";
import { WifiOff, RefreshCw } from "lucide-react";
import { OfflineQueuePanel } from "./offline-queue-panel/OfflineQueuePanel";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { queue, isSyncing } = useOfflineQueueStore();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Initial check
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && queue.length === 0 && !isSyncing) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      {isPanelOpen && (
        <OfflineQueuePanel onClose={() => setIsPanelOpen(false)} />
      )}
      <button 
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 ${
        isOffline 
          ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400" 
          : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
      }`}>
        {isOffline ? (
          <>
            <div className="p-1.5 bg-red-500/20 rounded-full">
              <WifiOff className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p>You are offline</p>
              {queue.length > 0 && (
                <p className="text-xs opacity-80 mt-0.5">{queue.length} items waiting to sync</p>
              )}
            </div>
          </>
        ) : isSyncing ? (
          <>
            <div className="p-1.5 bg-blue-500/20 rounded-full">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="text-left">
              <p>Syncing data...</p>
              <p className="text-xs opacity-80 mt-0.5">{queue.length} items remaining</p>
            </div>
          </>
        ) : queue.length > 0 ? (
          <>
             <div className="p-1.5 bg-blue-500/20 rounded-full">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p>Waiting for sync...</p>
              <p className="text-xs opacity-80 mt-0.5">{queue.length} items pending</p>
            </div>
          </>
        ) : null}
      </button>
    </div>
  );
}
