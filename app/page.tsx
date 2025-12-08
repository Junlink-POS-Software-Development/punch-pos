"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Navigation from "../components/navigation/Navigation";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useDashboardData } from "./dashboard/hooks/useDashboardData";

// --- Local Components ---
import SearchBar from "./components/SearchBar";
import Notifications from "./components/Notifications";
import UserProfile from "./components/UserProfile";

// --- Charts & Widgets ---
import {
  ProfitTrendChart,
  CategoryDonutChart,
} from "./components/DashboardCharts";
import {
  LowStockWidget,
  TopProductsWidget,
} from "./components/DashboardWidgets";
import { RecentTransactionsWidget } from "./dashboard/components/RecentTransactionsWidget";

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

const DashboardStats = dynamic(
  () =>
    import("./components/DashboardStats").then((mod) => ({
      default: mod.DashboardStats,
    })),
  { ssr: true }
);

type AuthModalState = "hidden" | "signIn" | "signUp";

export default function HomePage() {
  // --- AUTH STATE MANAGEMENT ---
  const { user, isAuthReady, signOut } = useAuthStore();
  const [authModalState, setAuthModalState] =
    useState<AuthModalState>("hidden");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- DATA FETCHING ---
  const { metrics, isLoading, error } = useDashboardData();

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

      // Execute the robust signOut (wipes storage and state)
      await signOut();

      // Short aesthetic delay
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Logout process error:", error);
    } finally {
      // FORCE REFRESH: Now safe because storage is wiped.
      // The browser will reload, see no token in storage, and render as 'Guest'.
      window.location.reload();
    }
  };

  // --- LOADING STATE ---
  if (isLoading && !metrics.dailySales) {
    return (
      <div className="flex justify-center items-center bg-[#0B1120] min-h-screen text-white">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 bg-[#0B1120] min-h-screen text-white">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-8 h-8" />
          <h2 className="font-semibold text-xl">Failed to load dashboard</h2>
        </div>
        <p className="text-slate-400">
          {error.message || "Connection timed out."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

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
          <h1 className="font-bold text-4xl tracking-tight">Home</h1>
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
      <Navigation />

      {/* 3. STATS CARDS */}
      <DashboardStats
        metrics={{
          totalCustomers: metrics.totalCustomers,
          dailySales: metrics.dailySales,
          netProfit: metrics.netProfit,
        }}
        loading={isLoading}
      />

      {/* 4. CHARTS SECTION */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mt-6 mb-6">
        {/* Profit Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
          <h3 className="mb-4 font-semibold text-lg">Profit Trend (30 Days)</h3>
          <ProfitTrendChart data={metrics.profitTrend} />
        </div>

        {/* Category Donut Chart */}
        <div className="lg:col-span-1 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl glass-effect">
          <h3 className="mb-4 font-semibold text-lg text-center">
            Sales by Category
          </h3>
          <CategoryDonutChart data={metrics.categorySales} />
        </div>
      </div>

      {/* 5. WIDGETS SECTION */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 mb-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-slate-900/50 p-6 border border-slate-800 rounded-2xl overflow-hidden glass-effect">
          <RecentTransactionsWidget transactions={metrics.recentTransactions} />
        </div>

        {/* Side Widgets (Low Stock & Top Products) */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <LowStockWidget items={metrics.lowStockItems} />
          <TopProductsWidget products={metrics.topProducts} />
        </div>
      </div>

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
