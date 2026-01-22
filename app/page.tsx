"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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
    window.location.href = "/";
  };

  const onSignOutClick = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Logout process error:", error);
    } finally {
      window.location.href = "/login";
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

      {/* 1. HEADER SECTION - Modern SaaS 3-Column Layout */}
      <header className="flex items-center justify-between gap-6 mb-10">
        {/* LEFT: Logo Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <Image
            src="/punch-logo.png"
            alt="PUNCH POS Logo"
            width={56}
            height={56}
            className="object-contain"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl tracking-tight animate-text-shine">
              <span className="font-bold">PUNCH</span>
              <span className="font-light text-slate-300"> POS</span>
            </h1>
            <p className="text-[10px] text-slate-500 tracking-wide">
              by JunLink Software Services
            </p>
          </div>
        </div>

        {/* CENTER: Search Bar */}
        <div className="flex-1 flex justify-center max-w-md mx-auto">
          <SearchBar />
        </div>

        {/* RIGHT: User Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Welcome Text - Subtle */}
          <p className="hidden lg:block text-xs text-slate-500 text-right">
            {user
              ? `Welcome, ${user.user_metadata?.first_name || "Admin"}`
              : "Guest"}
          </p>

          {/* Divider */}
          <div className="hidden lg:block w-px h-6 bg-slate-700" />

          {/* Notification & Profile Group */}
          <div className="flex items-center gap-3">
            <Notifications />
            {!isAuthReady ? (
              <div className="bg-slate-800 rounded-full w-9 h-9 animate-pulse" />
            ) : (
              <UserProfile
                currentUser={user}
                onSignInClick={openSignInModal}
                onSignOutClick={onSignOutClick}
              />
            )}
          </div>
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
