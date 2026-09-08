// components/SplitScreenSlider.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "../../app/hooks/useMediaQuery";
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
  const { viewState, posMode, isFullscreen } = useViewStore();
  const isTabletMode = posMode === 'tablet';

  // Auth State
  const { user, signOut } = useAuthStore();
  const [authModalState, setAuthModalState] = useState<AuthModalState>("hidden");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  if (isFullScreenRoute) {
    return <>{children}</>;
  }

  const isTerminal = pathname === "/";

  // --- MAIN LAYOUT ---
  return (
    <div className={`flex bg-background h-screen overflow-hidden text-foreground font-lexend ${isTabletMode || isFullscreen ? "" : "lg:pl-20"}`}>
      {/* Sidebar - hidden in fullscreen and hidden on mobile (< lg) */}
      {!isFullscreen && <Navigation variant="sidebar" />}

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
        
        <main className={`flex-1 flex flex-col ${isTerminal ? "overflow-hidden" : "overflow-y-auto"} ${isFullscreen ? "p-2" : `p-2 pt-0 ${isTerminal ? "pb-16 lg:pb-0" : "pb-20 lg:pb-0"}`}`}>
            {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden in fullscreen & desktop) */}
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
