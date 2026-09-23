// components/SplitScreenSlider.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useViewStore } from "./store/useViewStore";
import { Navigation } from "../navigation/Navigation";
import { MobileBottomNav } from "../navigation/MobileBottomNav";
import { Header } from "../Header";
import { SubscriptionExpiryBanner } from "../subscription/SubscriptionExpiryBanner";
import { useAuthStore } from "@/store/useAuthStore";
import { X, Loader2, Minimize2 } from "lucide-react";

// Dynamic imports for modals (Moved from app/page.tsx)
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

export function MainWindow({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { 
    posMode, 
    isFullscreen, 
    setIsFullscreen,
    autoFullscreenEnabled,
    autoFullscreenMinutes,
    recordSidebarInteraction,
    isSidebarCollapsed,
  } = useViewStore();
  const isTabletMode = posMode === 'tablet';

  // Auth State
  const { signOut } = useAuthStore();
  const [authModalState, setAuthModalState] = useState<AuthModalState>("hidden");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAutoFullscreenToast, setShowAutoFullscreenToast] = useState(false);

  // Bypass split-screen layout for specific routes (maintenance, login, auth callbacks, etc.)
  const fullScreenRoutes = ["/maintenance", "/login", "/onboarding", "/auth", "/api"];
  const isFullScreenRoute = fullScreenRoutes.some(route => pathname?.startsWith(route));
  
  // Auth Handlers
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

  const isTerminal = pathname === "/";

  // Reset timer on arrival at the terminal from another route
  useEffect(() => {
    if (isTerminal) {
      recordSidebarInteraction();
    }
  }, [pathname, isTerminal, recordSidebarInteraction]);

  // Auto-fullscreen watcher:
  // Automatically enters fullscreen on the terminal after few minutes of not accessing the sidebar navigation
  useEffect(() => {
    if (!isTerminal || !autoFullscreenEnabled || isFullscreen) {
      return;
    }

    const timeoutMs = Math.max(1, autoFullscreenMinutes) * 60 * 1000;

    const checkTimer = () => {
      const state = useViewStore.getState();
      if (!state.autoFullscreenEnabled || state.isFullscreen) return;

      const elapsed = Date.now() - state.lastSidebarInteraction;
      if (elapsed >= timeoutMs) {
        setIsFullscreen(true);
        setShowAutoFullscreenToast(true);
        setTimeout(() => setShowAutoFullscreenToast(false), 4500);
      }
    };

    const intervalId = setInterval(checkTimer, 2000);
    return () => clearInterval(intervalId);
  }, [isTerminal, autoFullscreenEnabled, isFullscreen, autoFullscreenMinutes, setIsFullscreen]);

  if (isFullScreenRoute) {
    return <>{children}</>;
  }

  // --- MAIN LAYOUT ---
  return (
    <div className={`flex bg-background h-screen overflow-hidden text-foreground font-lexend transition-all duration-300 ${
      isTabletMode || isFullscreen
        ? ""
        : isSidebarCollapsed
        ? "lg:pl-20"
        : "lg:pl-64"
    }`}>
      {/* Sidebar - hidden in fullscreen and hidden in tablet mode or on mobile (< lg) */}
      {!isFullscreen && !isTabletMode && (
        <Navigation variant="sidebar" />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {!isFullscreen && (
          <>
            <Header 
              onSignInClick={openSignInModal} 
              onSignOutClick={onSignOutClick} 
            />
            <SubscriptionExpiryBanner />
          </>
        )}
        
        <main className={`flex-1 flex flex-col ${isTerminal ? "overflow-hidden" : "overflow-y-auto"} ${
          isFullscreen
            ? "p-2"
            : `p-2 pt-0 ${
                isTerminal
                  ? isTabletMode
                    ? "pb-16"
                    : "pb-16 lg:pb-0"
                  : isTabletMode
                  ? "pb-28"
                  : "pb-28 lg:pb-0"
              }`
        }`}>
            {children}
        </main>
      </div>

      {/* Mobile/Tablet Bottom Navigation Bar (Hidden in fullscreen) */}
      {!isFullscreen && <MobileBottomNav />}

      {/* Floating Exit Fullscreen Button */}
      {isFullscreen && (
        <button
          type="button"
          onClick={() => useViewStore.getState().toggleFullscreen()}
          className="fixed top-3 right-4 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 hover:bg-card text-foreground border border-border/80 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 group text-xs font-semibold cursor-pointer"
          title="Exit Fullscreen Mode (Tab)"
        >
          <Minimize2 className="w-3.5 h-3.5 text-primary group-hover:rotate-90 transition-transform duration-300" />
          <span>Exit Fullscreen</span>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border/70 text-muted-foreground">
            Tab
          </kbd>
        </button>
      )}

      {/* Auto-Fullscreen Notification Toast */}
      {showAutoFullscreenToast && isFullscreen && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/95 text-foreground border border-primary/40 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300 text-xs font-semibold select-none">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Terminal entered fullscreen (sidebar idle for {autoFullscreenMinutes}m)</span>
          <span className="text-muted-foreground hidden sm:inline">• Press <kbd className="px-1 py-0.5 rounded bg-muted border font-mono text-[10px]">Tab</kbd> or click Exit to restore</span>
        </div>
      )}

      {/* Auth Modals & Overlays */}
      {isLoggingOut && (
        <div className="z-60 fixed inset-0 flex flex-col justify-center items-center bg-background/80 backdrop-blur-sm transition-all duration-300">
          <Loader2 className="mb-4 w-12 h-12 text-primary animate-spin" />
          <span className="font-bold text-primary text-2xl tracking-widest">
            LOGGING OUT...
          </span>
        </div>
      )}

      {authModalState !== "hidden" && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-background/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="top-4 right-4 z-50 absolute p-2 text-muted-foreground hover:text-foreground transition-colors"
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
