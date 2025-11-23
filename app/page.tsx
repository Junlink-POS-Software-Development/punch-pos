// page.tsx (DashboardHomePage)
"use client";

import React, { useState, useEffect } from "react";
import Navigation from "../components/navigation/Navigation";
import { TrendingDown, Brain, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

// Import Local Components
import SearchBar from "./components/SearchBar";
import Notifications from "./components/Notifications";
import UserProfile from "./components/UserProfile";
import { handleLogOut } from "@/components/sales-terminnal/components/buttons/handlers";
import { SignUp } from "@/components/sign-in/SignUp";
import { SignIn } from "@/components/sign-in/SignIn";

type AuthModalState = "hidden" | "signIn" | "signUp";

export default function DashboardHomePage() {
  // --- AUTH STATE MANAGEMENT ---
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // 1. Check initial session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUser(data.session?.user || null);
    };
    checkSession();

    // 2. Listen for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setCurrentUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // --- HANDLERS ---
  const openSignInModal = () => setAuthModalState("signIn");
  const openSignUpModal = () => setAuthModalState("signUp");
  const closeModal = () => setAuthModalState("hidden");

  const handleLoginSuccess = () => {
    closeModal();
  };

  const onSignOutClick = async () => {
    setIsLoggingOut(true);
    await handleLogOut();
    // Artificial delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoggingOut(false);
    setCurrentUser(null);
  };

  return (
    <div className="relative bg-[#0B1120] p-6 min-h-screen text-white">
      {/* --- LOGOUT OVERLAY --- */}
      {isLoggingOut && (
        <div className="z-[60] fixed inset-0 flex flex-col justify-center items-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <Loader2 className="mb-4 w-12 h-12 text-cyan-400 animate-spin" />
          <span className="font-bold text-cyan-400 text-2xl tracking-widest">
            LOGGING OUT...
          </span>
        </div>
      )}

      {/* 1. HEADER SECTION */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Home Page</h1>
          <p className="mt-1 text-slate-500 text-sm">
            {currentUser
              ? `Welcome back, ${
                  currentUser.user_metadata?.first_name || "Admin"
                }`
              : "Welcome, Guest"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <SearchBar />
          <div className="hidden md:block bg-slate-700 mx-1 w-px h-8"></div>
          <Notifications />
          {/* Pass Auth Props to UserProfile */}
          <UserProfile
            currentUser={currentUser}
            onSignInClick={openSignInModal}
            onSignOutClick={onSignOutClick}
          />
        </div>
      </header>

      {/* 2. NAVIGATION GRID */}
      <Navigation />

      {/* 3. STATS CARDS */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mt-8">
        {/* --- LEFT COLUMN --- */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/50 hover:bg-slate-900/80 p-6 border border-slate-800 rounded-2xl transition-colors glass-effect">
            <h3 className="font-medium text-slate-400 text-sm uppercase tracking-wider">
              Total Customers
            </h3>
            <p className="mt-3 font-bold text-white text-5xl tracking-tighter">
              10,238
            </p>
            <p className="flex items-center gap-2 mt-2 font-medium text-green-400 text-sm">
              <TrendingDown className="w-4 h-4 rotate-180" />
              +12% from last month
            </p>
          </div>

          <div className="bg-slate-900/50 hover:bg-slate-900/80 p-6 border border-slate-800 rounded-2xl transition-colors glass-effect">
            <h3 className="font-medium text-slate-400 text-sm uppercase tracking-wider">
              Daily Sales
            </h3>
            <p className="mt-3 font-bold text-white text-5xl tracking-tighter">
              $73,495
            </p>
            <p className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
              <span className="bg-yellow-500 rounded-full w-2 h-2"></span>
              Pending validation: 4
            </p>
          </div>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-gradient-to-b from-slate-900/50 to-slate-900/80 p-8 border border-slate-800 rounded-2xl glass-effect">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-cyan-400" />
              <h3 className="font-semibold text-slate-200">JunFue Chat</h3>
            </div>
            {/* Chat content... */}
            <div className="space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <div className="bg-cyan-500 mt-2 rounded-full w-1.5 h-1.5 shrink-0"></div>
                <p className="text-sm leading-relaxed">
                  System optimization recommended for inventory module.
                </p>
              </div>
              {/* ... more items */}
            </div>
          </div>

          <button className="group hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,189,212,0.15)] p-4 border border-slate-700 hover:border-cyan-500 rounded-xl w-full font-semibold text-white text-lg transition-all glass-effect">
            See More Details
          </button>
        </div>
      </div>

      {/* --- AUTH MODALS (Moved from SalesTerminal) --- */}
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
