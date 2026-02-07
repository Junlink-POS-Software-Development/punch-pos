"use client";

import { useState, Suspense } from "react";
import { SignIn } from "@/components/sign-in/SignIn";
import { SignUp } from "@/components/sign-in/SignUp";

export default function LoginPage() {
  const [view, setView] = useState<"signIn" | "signUp">("signIn");

  const handleLoginSuccess = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] p-6 text-white">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          {view === "signIn" ? (
            <SignIn
              onSwitchToSignUp={() => setView("signUp")}
              onSuccess={handleLoginSuccess}
            />
          ) : (
            <SignUp onSwitchToSignIn={() => setView("signIn")} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
