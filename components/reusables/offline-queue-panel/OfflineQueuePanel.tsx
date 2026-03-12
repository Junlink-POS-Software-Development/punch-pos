"use client";

import { useOfflineQueueStore } from "@/store/useOfflineQueueStore";
import { formatDistanceToNow } from "date-fns";
import { X, Trash2, ShoppingCart, Banknote, AlertCircle } from "lucide-react";
import { TransactionHeader, TransactionItem } from "@/app/actions/transactions";
import { CashoutInput } from "@/app/cashout/lib/cashout.api";

interface OfflineQueuePanelProps {
  onClose: () => void;
}

export function OfflineQueuePanel({ onClose }: OfflineQueuePanelProps) {
  const { queue, dequeue, isSyncing } = useOfflineQueueStore();

  const handleCancel = (id: string) => {
    dequeue(id);
    // Note: We might also want to trigger a rollback in the optimistic cache here
    // But for a simple approach, cancelling stops it from syncing. The UI might
    // stay optimistic until a refresh, or we can handle complex rollbacks later.
  };

  return (
    <div className="absolute bottom-full mb-4 right-0 w-80 bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 z-50">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div>
          <h3 className="font-semibold text-foreground">Offline Queue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSyncing ? "Syncing..." : `${queue.length} items waiting`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[300px] overflow-y-auto p-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 mb-2 text-green-500 opacity-80" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs opacity-75 mt-1">No items waiting to sync.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {queue.map((item) => {
              const timeAgo = formatDistanceToNow(item.timestamp, { addSuffix: true });
              
              if (item.type === "transaction") {
                const payload = item.payload as { headerPayload: TransactionHeader, itemsPayload: TransactionItem[] };
                const itemCount = payload.itemsPayload.length;
                const total = payload.headerPayload.grand_total;
                
                return (
                  <div key={item.id} className="p-3 bg-muted/40 border border-border/50 rounded-lg flex items-start gap-3 group relative overflow-hidden">
                    <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg mt-0.5">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        Sale • ₱{total.toLocaleString()}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {timeAgo}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancel(item.id)}
                      disabled={isSyncing}
                      className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                      title="Cancel transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isSyncing && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                );
              }

              if (item.type === "cashout") {
                const payload = item.payload as CashoutInput;
                return (
                  <div key={item.id} className="p-3 bg-muted/40 border border-border/50 rounded-lg flex items-start gap-3 group relative overflow-hidden">
                    <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg mt-0.5">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {payload.cashout_type} • ₱{payload.amount.toLocaleString()}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {payload.notes || "No notes"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {timeAgo}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancel(item.id)}
                      disabled={isSyncing}
                      className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                      title="Cancel cashout"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isSyncing && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
      
      {queue.length > 0 && (
        <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <p>These actions will be automatically synced when connection is restored.</p>
        </div>
      )}
    </div>
  );
}
// Placeholder CheckCircle2 to avoid another import error 
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
