"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Key, Users, Loader2, ArrowRight, LogOut, RefreshCw, Copy, Check, Clock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { ExitStoreModal } from "./ExitStoreModal";
import { useStoreAccess } from "@/app/settings/hooks/useStoreAccess";

export function StoreAccessSection() {
  const { user } = useAuthStore();
  const [copied, setCopied] = React.useState(false);
  const {
    role,
    isLoading,
    generatedCode,
    timeRemaining,
    codeMessage,
    isGenerating,
    joinId,
    setJoinId,
    isExitModalOpen,
    setIsExitModalOpen,
    joinMessage,
    isJoining,
    handleGenerateCode,
    handleJoinStore,
  } = useStoreAccess();

  if (!user || isLoading) return null;

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (role === "member") {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-destructive flex items-center gap-2 m-0 p-0 leading-none">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Exit Store
          </h3>
          <p className="text-sm text-destructive/80 mt-2 max-w-lg leading-relaxed">
            You are currently a member of this store. Leaving will permanently revoke your access to its data until you're invited again.
          </p>
        </div>
        <button
          onClick={() => setIsExitModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 py-3 rounded-xl font-bold transition-all shrink-0 active:scale-[0.98] w-full sm:w-auto shadow-sm"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Exit Store
        </button>
        {isExitModalOpen && <ExitStoreModal onClose={() => setIsExitModalOpen(false)} />}
      </div>
    );
  }

  const isCodeActive = !!generatedCode && !!timeRemaining;

  return (
    <div className="bg-card/50 border border-border rounded-2xl shadow-sm backdrop-blur-sm p-8 space-y-10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <ShieldCheck className="w-6 h-6 shrink-0" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-foreground leading-none">Access & Enrollment</h3>
            <p className="text-sm text-muted-foreground mt-1 text-balance">Manage how other administrators find and join your store ecosystem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Generate Enrollment Code */}
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground/50">
                    <Key className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest opacity-70">Enrollment Code</h4>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
                Generate a temporary enrollment code that expires in 1 hour. Share it with staff members so they can join your store.
            </p>

            <div className="flex flex-col gap-3">
                {isCodeActive ? (
                  <>
                    {/* Active Code Display */}
                    <div className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Code</span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{timeRemaining}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-center text-2xl font-mono font-bold tracking-[0.3em] text-foreground select-all">
                          {generatedCode}
                        </code>
                        <button
                          onClick={handleCopyCode}
                          className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95"
                          title="Copy code"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Regenerate Button */}
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGenerating}
                      className="flex justify-center items-center gap-2 bg-muted/50 hover:bg-muted disabled:opacity-50 px-6 py-3 rounded-xl font-bold text-muted-foreground hover:text-foreground transition-all active:scale-[0.98]"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {isGenerating ? "Generating..." : "Regenerate Code"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGenerateCode}
                    disabled={isGenerating}
                    className="flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 px-6 py-3 rounded-xl font-bold text-primary-foreground transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isGenerating ? "Generating..." : "Generate Enrollment Code"}
                  </button>
                )}

                {codeMessage && (
                    <p className={`text-xs text-center font-medium ${codeMessage.includes("success") ? "text-emerald-500" : "text-destructive"}`}>
                        {codeMessage}
                    </p>
                )}
            </div>
        </div>

        {/* Join Existing Store */}
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <Users className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm uppercase tracking-widest opacity-70">Join Existing Store</h4>
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
                        placeholder="Enrollment Code to Join"
                        className="w-full bg-muted/20 border border-border/50 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/30"
                    />
                </div>
                <button
                    onClick={handleJoinStore}
                    disabled={isJoining || !joinId.trim()}
                    className="flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-6 py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/15"
                >
                    {isJoining ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4 text-white" />}
                    {isJoining ? "Joining..." : "Join Existing Store"}
                </button>
                {joinMessage && (
                    <p className={`text-xs text-center font-medium ${joinMessage.includes("success") ? "text-emerald-500" : "text-destructive"}`}>
                        {joinMessage}
                    </p>
                )}
            </div>
        </div>
      </div>

      {isExitModalOpen && <ExitStoreModal onClose={() => setIsExitModalOpen(false)} />}
    </div>
  );
}
