"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Navigation from "../components/navigation/Navigation";
import { X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMediaQuery } from "./hooks/useMediaQuery";
import Header from "@/components/Header";

// --- Local Components ---
// Imported for Mobile View Header usage
// import SearchBar from "./components/SearchBar"; 
// import Notifications from "./components/Notifications";
// import UserProfile from "./components/UserProfile";
// Actually Header component handles these now.

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

// Dynamic import for SalesTerminal
const SalesTerminal = dynamic(
  () => import("@/components/sales-terminnal/SalesTerminal"),
  { ssr: false }
);

type AuthModalState = "hidden" | "signIn" | "signUp";

export default function HomePage() {
  // --- AUTH STATE MANAGEMENT (For Mobile View) ---
  const { user, isAuthReady, signOut } = useAuthStore();
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isMobile = useMediaQuery("(max-width: 1024px)");

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

  // --- DESKTOP VIEW ---
  // Render SalesTerminal directly. MainWindow handles Sidebar and Header.
  if (!isMobile) {
    return <SalesTerminal />;
  }

  // --- MOBILE VIEW ---
  // Keep the old layout: Header + Navigation Grid
  return (
    <div className="relative bg-[#0B1120] p-6 min-h-screen text-white font-lexend">
      {/* --- LOGOUT OVERLAY --- */}
      {isLoggingOut && (
        <div className="z-60 fixed inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <Loader2 className="mb-4 w-12 h-12 text-cyan-400 animate-spin" />
          <span className="font-bold text-cyan-400 text-2xl tracking-widest">
            LOGGING OUT...
          </span>
        </div>
      )}

      {/* 1. HEADER SECTION - Reused Header Component */}
      <Header 
        onSignInClick={openSignInModal} 
        onSignOutClick={onSignOutClick} 
      />

      {/* 2. NAVIGATION GRID */}
      <Navigation variant="grid" />

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
