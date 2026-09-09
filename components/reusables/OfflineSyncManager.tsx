"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOfflineQueueStore } from "@/store/useOfflineQueueStore";
import { processTransaction, TransactionHeader, TransactionItem } from "@/app/actions/transactions";
import { createExpense, CashoutInput } from "@/app/cashout/lib/cashout.api";

export function OfflineSyncManager() {
  const queryClient = useQueryClient();
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

      // Invalidate and refetch payments, line items, and dashboard
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.refetchQueries({ queryKey: ["payments"], type: "all" });
      queryClient.refetchQueries({ queryKey: ["transaction-items"], type: "all" });
    };

    window.addEventListener("online", handleOnline);

    // Also attempt sync on mount if online
    if (navigator.onLine) {
        handleOnline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [queue, isSyncing, setSyncing, dequeue, queryClient]);

  return null; // Headless component
}
