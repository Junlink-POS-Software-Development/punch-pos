"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function JoinStoreSection() {
  const { user } = useAuthStore();
  const [joinId, setJoinId] = React.useState("");
  const [isJoining, setIsJoining] = React.useState(false);
  const [joinMessage, setJoinMessage] = React.useState("");

  const handleJoinStore = async () => {
    if (!joinId.trim()) return;
    setIsJoining(true);
    setJoinMessage("");
    try {
      const { joinStoreViaEnrollmentId } = await import("@/app/actions/store");
      const result = await joinStoreViaEnrollmentId(joinId);
      if (result.success) {
        setJoinMessage("Successfully joined store! Refreshing...");
        window.location.reload();
      } else {
        setJoinMessage("Failed to join: " + result.error);
      }
    } catch (error) {
      setJoinMessage("An error occurred.");
    } finally {
      setIsJoining(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-card/50 p-8 border border-border rounded-xl shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Join Existing Store</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Enter a valid enrollment ID to join a company or another existing store.
          </p>
        </div>

        <div className="flex items-start gap-4 bg-destructive/10 p-5 border border-destructive/20 rounded-xl text-destructive text-sm leading-relaxed">
          <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0" />
          <p>
            <span className="font-bold">CAUTION:</span> Joining a new store will transfer your account access. If you are the sole member of your current store, <span className="font-bold underline">all store data will be permanently purged</span> upon joining a new one.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Existing Store Enrollment ID"
              className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/50"
            />
          </div>
          <button
            onClick={handleJoinStore}
            disabled={isJoining || !joinId.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-8 py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
          >
            {isJoining ? "Joining..." : "Join Store"}
          </button>
        </div>
        {joinMessage && (
          <p className={`text-sm ml-1 font-medium ${joinMessage.includes("success") ? "text-emerald-500" : "text-destructive"}`}>
            {joinMessage}
          </p>
        )}
      </div>
    </div>
  );
}
