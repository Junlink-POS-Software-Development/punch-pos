import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as idb from "idb-keyval";

export type QueuedActionType = "transaction" | "cashout";

export interface QueuedAction {
  id: string; // unique local ID (e.g., UUID or timestamp)
  type: QueuedActionType;
  payload: any; // The payload to send to the server action
  timestamp: number;
}

interface OfflineQueueState {
  queue: QueuedAction[];
  isSyncing: boolean;
  enqueue: (action: Omit<QueuedAction, "id" | "timestamp">) => void;
  dequeue: (id: string) => void;
  setSyncing: (status: boolean) => void;
  clearQueue: () => void;
}

// Custom storage utilizing IndexedDB to avoid localStorage quotas
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await idb.get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await idb.set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await idb.del(name);
  },
};

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set) => ({
      queue: [],
      isSyncing: false,
      enqueue: (action) =>
        set((state) => ({
          queue: [
            ...state.queue,
            {
              ...action,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),
      dequeue: (id) =>
        set((state) => ({
          queue: state.queue.filter((q) => q.id !== id),
        })),
      setSyncing: (status) => set({ isSyncing: status }),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: "pos-offline-queue",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
