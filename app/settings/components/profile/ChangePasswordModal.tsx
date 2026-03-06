"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, Loader2, X, AlertTriangle, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { requestPasswordReset, verifyResetOtp, updatePassword } from "@/app/actions/auth";
import { useAuthStore } from "@/store/useAuthStore";

interface ChangePasswordModalProps {
  onClose: () => void;
}

type Step = "request" | "verify" | "update" | "success";

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-trigger OTP request if we have an email
  useEffect(() => {
    if (step === "request" && user?.email) {
      handleRequestOTP();
    }
  }, [step, user?.email]);

  const handleRequestOTP = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(user.email);
      if (result.success) {
        setStep("verify");
      } else {
        setError(result.error || "Failed to send reset code. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred sending the OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || otp.length !== 8) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyResetOtp(user.email, otp);
      if (result.success) {
        setStep("update");
      } else {
        setError(result.error || "Invalid OTP. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updatePassword(newPassword);
      if (result.success) {
        setStep("success");
        setTimeout(() => onClose(), 2000);
      } else {
        setError(result.error || "Failed to update password. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred updating your password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${step === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
              {step === "verify" ? <Mail className="w-5 h-5" /> : 
               step === "success" ? <ShieldCheck className="w-5 h-5" /> : 
               <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-lg">
                {step === "request" ? "Requesting Reset..." :
                 step === "verify" ? "Verify Code" :
                 step === "update" ? "Update Password" : "Password Updated"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {step === "request" ? "Please wait" :
                 step === "verify" ? "Sent to your email" :
                 step === "update" ? "Secure your account" : "New password is active"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
            disabled={isLoading || step === "success"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {step === "request" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Sending secure code to {user?.email}...</p>
            </div>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground ml-1">8-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                  placeholder="00000000"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-muted/30 border border-border rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 8}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
              
              <p className="text-xs text-center text-muted-foreground">
                Didn't receive a code? <button type="button" onClick={handleRequestOTP} className="text-primary hover:underline font-medium">Resend Email</button>
              </p>
            </form>
          )}

          {step === "update" && (
            <form onSubmit={handleUpdatePassword} className="space-y-5 animate-in slide-in-from-right-4 duration-300 gap-y-2">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground ml-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="text-sm font-bold text-muted-foreground ml-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save New Password"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-50 duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Password Protected</h3>
                <p className="text-sm text-muted-foreground mt-1 cursor-default max-w-[250px] mx-auto">
                  Your new password is now successfully active across all devices.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
