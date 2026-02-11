"use client";

import { Calendar as CalendarIcon, Lock, Unlock, LogOut } from "lucide-react";
import dayjs from "dayjs";
import { useTransactionStore } from "./stores/useTransactionStore";
import { useStaffPermissions } from "./stores/useStaffPermissions";

export default function BackdateSettings() {
  const { customTransactionDate, setCustomTransactionDate } =
    useTransactionStore();
  const { canBackdate, isLoading } = useStaffPermissions();

  if (isLoading)
    return <div className="text-slate-500">Loading permissions...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex justify-center items-center rounded-xl w-12 h-12 shadow-inner border ${
            canBackdate
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
              : "bg-muted text-muted-foreground border-border/50"
          }`}
        >
          <CalendarIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Transaction Date Override
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {canBackdate
              ? "Authorized to backdate sales for historical record keeping."
              : "Unauthorized to backdate sales. Live time recording only."}
          </p>
        </div>
      </div>

      {!canBackdate ? (
        <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 p-4 border border-border/50 rounded-xl italic text-sm">
          <Lock className="w-4 h-4" />
          <span>
            Date selection is locked. All transactions will be recorded at{" "}
            <span className="font-bold text-foreground">Live System Time</span>.
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start gap-3 bg-amber-500/10 p-5 border border-amber-500/20 rounded-xl text-amber-600 text-sm leading-relaxed">
            <Unlock className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <span className="font-bold uppercase tracking-tighter">Active override:</span> Any new sale performed will use the custom timestamp selected below. Ensure this is intentional.
            </span>
          </div>

          <div className="space-y-3">
             <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                Effective Date for Next Sale
             </label>
             <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                <input
                  type="datetime-local"
                  className="bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50 h-[48px] text-foreground"
                  value={
                    customTransactionDate
                      ? dayjs(customTransactionDate).format("YYYY-MM-DDTHH:mm")
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    const dateStr = val ? new Date(val).toISOString() : null;
                    setCustomTransactionDate(dateStr);
                  }}
                />

                {customTransactionDate && (
                  <button
                    onClick={() => setCustomTransactionDate(null)}
                    className="flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive/20 px-6 py-3 border border-destructive/20 rounded-xl h-[48px] text-destructive font-bold transition-all active:scale-[0.98]"
                  >
                    <LogOut className="w-4 h-4" />
                    End Session
                  </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
