"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, Key, Users, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function StoreAccessSection() {
  const { user } = useAuthStore();
  const [enrollmentId, setEnrollmentId] = useState("");
  const [joinId, setJoinId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");
  const [joinMessage, setJoinMessage] = useState("");

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const { getStoreEnrollmentId } = await import("@/app/actions/store");
        const result = await getStoreEnrollmentId();
        if (result.success && result.enrollmentId) {
          setEnrollmentId(result.enrollmentId);
        }
      } catch (error) {
        console.error("Failed to fetch enrollment ID", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchEnrollment();
  }, [user]);

  const handleUpdateEnrollment = async () => {
    setIsSaving(true);
    setEnrollmentMessage("");
    try {
      const { updateStoreEnrollmentId } = await import("@/app/actions/store");
      const result = await updateStoreEnrollmentId(enrollmentId);
      if (result.success) {
        setEnrollmentMessage("Enrollment ID updated successfully.");
      } else {
        setEnrollmentMessage("Failed to update: " + result.error);
      }
    } catch {
      setEnrollmentMessage("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

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
    } catch {
      setJoinMessage("An error occurred.");
    } finally {
      setIsJoining(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-card/50 border border-border rounded-2xl shadow-sm backdrop-blur-sm p-8 space-y-10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-foreground leading-none">Access & Enrollment</h3>
            <p className="text-sm text-muted-foreground mt-1 text-balance">Manage how other administrators find and join your store ecosystem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Manage Enrollment */}
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground/50">
                    <Key className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest opacity-70">Enrollment ID</h4>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
                Set a unique identifier for your store so other authorized members can adopt or join it via the POS platform.
            </p>

            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    value={enrollmentId}
                    onChange={(e) => setEnrollmentId(e.target.value)}
                    placeholder="Enter Custom Enrollment ID"
                    className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30"
                />
                <button
                    onClick={handleUpdateEnrollment}
                    disabled={isSaving || isLoading}
                    className="flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 px-6 py-3 rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSaving ? "Updating..." : "Update Enrollment"}
                </button>
                {enrollmentMessage && (
                    <p className={`text-xs text-center font-medium ${enrollmentMessage.includes("success") ? "text-emerald-500" : "text-destructive"}`}>
                        {enrollmentMessage}
                    </p>
                )}
            </div>
        </div>

        {/* Join Store */}
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <Users className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest opacity-70">Join Other Store</h4>
            </div>

            <div className="bg-destructive/5 p-4 border border-destructive/10 rounded-xl flex gap-3 text-destructive">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-[11px] leading-relaxed font-medium">
                    Joining a new store will transfer your access. Solitary store data will be <span className="underline uppercase">permanently purged</span> to free resources.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <div className="relative">
                    <input
                        type="text"
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        placeholder="Enrollment ID to Join"
                        className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30"
                    />
                </div>
                <button
                    onClick={handleJoinStore}
                    disabled={isJoining || !joinId.trim()}
                    className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-6 py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/15"
                >
                    {isJoining ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4 text-white" />}
                    {isJoining ? "Transferring..." : "Transfer Access"}
                </button>
                {joinMessage && (
                    <p className={`text-xs text-center font-medium ${joinMessage.includes("success") ? "text-emerald-500" : "text-destructive"}`}>
                        {joinMessage}
                    </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
