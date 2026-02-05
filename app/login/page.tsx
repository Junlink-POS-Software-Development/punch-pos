"use client";

import { useState } from "react";
import { SignIn } from "@/components/sign-in/SignIn";
import { SignUp } from "@/components/sign-in/SignUp";

export default function LoginPage() {
  const [view, setView] = useState<"signIn" | "signUp">("signIn");

  const handleLoginSuccess = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md">
        {view === "signIn" ? (
          <SignIn
            onSwitchToSignUp={() => setView("signUp")}
            onSuccess={handleLoginSuccess}
          />
        ) : (
          <SignUp onSwitchToSignIn={() => setView("signIn")} />
        )}
      </div>
    </div>
  );
}
