"use client";

import { useEffect } from "react";
import { useOfflineQueueStore } from "@/store/useOfflineQueueStore";
import { processTransaction, TransactionHeader, TransactionItem } from "@/app/actions/transactions";
import { createExpense, CashoutInput } from "@/app/cashout/lib/cashout.api";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function OfflineSyncManager() {
  const { queue, isSyncing, setSyncing, dequeue } = useOfflineQueueStore();

  useEffect(() => {
    const handleOnline = async () => {
      if (queue.length === 0 || isSyncing) return;
      
      console.log(`[OfflineSync] Back online. Processing ${queue.length} items from queue.`);
      setSyncing(true);

      for (const item of queue) {
        try {
          if (item.type === "transaction") {
            const payload = item.payload as { headerPayload: TransactionHeader, itemsPayload: TransactionItem[] };
            const res = await processTransaction(payload.headerPayload, payload.itemsPayload);
            if (res.success) {
              console.log(`[OfflineSync] Processed offline transaction: ${item.id}`);
              dequeue(item.id);
            } else {
              console.error(`[OfflineSync] Failed to process transaction: ${res.error}`);
            }
          } else if (item.type === "cashout") {
            const payload = item.payload as CashoutInput;
            await createExpense(payload);
            console.log(`[OfflineSync] Processed offline cashout: ${item.id}`);
            dequeue(item.id);
          }
        } catch (error) {
          console.error(`[OfflineSync] Error processing queue item ${item.id}:`, error);
          // Assuming a generic failure, keeping it in the queue to retry next time
        }
      }

      setSyncing(false);
    };

    window.addEventListener("online", handleOnline);

    // Also attempt sync on mount if online
    if (navigator.onLine) {
        handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [queue, isSyncing, setSyncing, dequeue]);

  return null; // Headless component
}
