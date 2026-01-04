"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Navigation from "../components/navigation/Navigation";
import { X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

// --- Local Components ---
import SearchBar from "./components/SearchBar";
import Notifications from "./components/Notifications";
import UserProfile from "./components/UserProfile";

// NOTE: All Data, Charts, and Widget imports have been removed to isolate the issue.

// Dynamic imports for modals
const SignUp = dynamic(
  () =>
    import("@/components/sign-in/SignUp").then((mod) => ({
      default: mod.SignUp,
    })),
  { ssr: false }
);

const SignIn = dynamic(
  () =>
    import("@/components/sign-in/SignIn").then((mod) => ({
      default: mod.SignIn,
    })),
  { ssr: false }
);

type AuthModalState = "hidden" | "signIn" | "signUp";

export default function HomePage() {
  // --- AUTH STATE MANAGEMENT ---
  const { user, isAuthReady, signOut } = useAuthStore();
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- DATA FETCHING REMOVED ---
  // The hook that was causing the timeout is completely commented out.
  // const { metrics, isLoading, error } = useDashboardData();

  // --- HANDLERS ---
  const openSignInModal = () => setAuthModalState("signIn");
  const openSignUpModal = () => setAuthModalState("signUp");
  const closeModal = () => setAuthModalState("hidden");

  const handleLoginSuccess = () => {
    closeModal();
  };

  const onSignOutClick = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Logout process error:", error);
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="relative bg-[#0B1120] p-6 min-h-screen text-white">
      {/* --- LOGOUT OVERLAY --- */}
      {isLoggingOut && (
        <div className="z-60 fixed inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <Loader2 className="mb-4 w-12 h-12 text-cyan-400 animate-spin" />
          <span className="font-bold text-cyan-400 text-2xl tracking-widest">
            LOGGING OUT...
          </span>
        </div>
      )}

      {/* 1. HEADER SECTION */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-bold text-4xl tracking-tight animate-text-shine">JUNLINK</h1>
          <p className="mt-2 text-slate-400 text-base">
            {user
              ? `Welcome back, ${user.user_metadata?.first_name || "Admin"}`
              : "Welcome, Guest"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar />
          <div className="hidden md:block bg-slate-700 mx-1 w-px h-8"></div>
          <Notifications />
          {!isAuthReady ? (
            <div className="bg-slate-800 rounded-full w-10 h-10 animate-pulse" />
          ) : (
            <UserProfile
              currentUser={user}
              onSignInClick={openSignInModal}
              onSignOutClick={onSignOutClick}
            />
          )}
        </div>
      </header>

      {/* 2. NAVIGATION GRID */}
      {/* This should now render instantly without any spinners blocking it */}
      <Navigation />

      {/* --- AUTH MODALS --- */}
      {authModalState !== "hidden" && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="top-4 right-4 z-50 absolute p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {authModalState === "signIn" ? (
              <SignIn
                onSwitchToSignUp={openSignUpModal}
                onSuccess={handleLoginSuccess}
              />
            ) : (
              <SignUp onSwitchToSignIn={openSignInModal} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
