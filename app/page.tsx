"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navigation from "../components/navigation/Navigation";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import dayjs from "dayjs";

// Import Local Components
import SearchBar from "./components/SearchBar";
import Notifications from "./components/Notifications";
import UserProfile from "./components/UserProfile";
import { handleLogOut } from "@/components/sales-terminnal/components/buttons/handlers";

// Dynamic imports for modals (only load when needed) - improves bundle size
const SignUp = dynamic(
  () => import("@/components/sign-in/SignUp").then(mod => ({ default: mod.SignUp })),
  { ssr: false }
);

const SignIn = dynamic(
  () => import("@/components/sign-in/SignIn").then(mod => ({ default: mod.SignIn })),
  { ssr: false }
);

// Dynamic import for stats section - improves initial load
const DashboardStats = dynamic(
  () => import("./components/DashboardStats").then(mod => ({ default: mod.DashboardStats })),
  { ssr: true }
);

type AuthModalState = "hidden" | "signIn" | "signUp";

export default function HomePage() {
  // --- AUTH STATE MANAGEMENT ---
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Prevent CLS during auth check

  useEffect(() => {
    // 1. Check initial session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUser(data.session?.user || null);
      setIsAuthLoading(false); // Mark as loaded to prevent layout shift
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

  // --- STATS DATA FETCHING ---
  const [statsMetrics, setStatsMetrics] = useState({
    totalCustomers: 0,
    dailySales: 0,
    netProfit: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);


  
  // Re-implementing the fetch correctly inside the effect
  useEffect(() => {
    async function fetchHomeStats() {
      try {
        setStatsLoading(true);
        const today = dayjs();

        const { data: payments } = await supabase
          .from("payments")
          .select("invoice_no, customer_name, grand_total, transaction_time");
          
        const { data: expenses } = await supabase
          .from("expenses")
          .select("amount, transaction_date");
          
        const { data: transactions } = await supabase
          .from("transactions")
          .select("cost_price, quantity, invoice_no");

        const uniqueCustomers = new Set(
          payments?.map((c) => c.customer_name).filter(Boolean)
        ).size;

        const todayPayments = payments?.filter(p => 
          p.transaction_time && dayjs(p.transaction_time).isSame(today, 'day')
        ) || [];
        
        const todaySales = todayPayments.reduce((sum, p) => sum + (Number(p.grand_total) || 0), 0);

        // COGS
        const invoiceDateMap = new Map();
        payments?.forEach(p => {
           if(p.invoice_no) invoiceDateMap.set(p.invoice_no, p.transaction_time);
        });

        const todayTransactions = transactions?.filter(t => {
          const time = invoiceDateMap.get(t.invoice_no);
          return time && dayjs(time).isSame(today, 'day');
        }) || [];

        const todayCOGS = todayTransactions.reduce((sum, t) => sum + ((Number(t.cost_price) || 0) * (Number(t.quantity) || 1)), 0);

        const todayExpenses = expenses?.filter(e => 
          dayjs(e.transaction_date).isSame(today, 'day')
        ).reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

        setStatsMetrics({
          totalCustomers: uniqueCustomers,
          dailySales: todaySales,
          netProfit: todaySales - todayCOGS - todayExpenses
        });

      } catch (error) {
        console.error("Error fetching home stats:", error);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchHomeStats();
  }, []);

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
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-bold text-4xl tracking-tight">Home</h1>
          <p className="mt-2 text-slate-400 text-base">
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
          {/* Show skeleton during auth loading to prevent CLS */}
          {isAuthLoading ? (
            <div className="w-10 h-10 bg-slate-800 animate-pulse rounded-full" />
          ) : (
            <UserProfile
              currentUser={currentUser}
              onSignInClick={openSignInModal}
              onSignOutClick={onSignOutClick}
            />
          )}
        </div>
      </header>

      {/* 2. NAVIGATION GRID */}
      <Navigation />

      {/* 3. STATS CARDS - Extracted to separate component for better code splitting */}
      <DashboardStats metrics={statsMetrics} loading={statsLoading} />

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
