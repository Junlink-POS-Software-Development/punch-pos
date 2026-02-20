// components/SplitScreenSlider.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "../../app/hooks/useMediaQuery";
import { useViewStore } from "./store/useViewStore";
import Navigation from "../navigation/Navigation";
import Header from "../Header";
import { useAuthStore } from "@/store/useAuthStore";
import { X, Loader2 } from "lucide-react";

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

export default function MainWindow({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { viewState } = useViewStore();

  // Auth State
  const { user, signOut } = useAuthStore();
  const [authModalState, setAuthModalState] = useState<AuthModalState>("hidden");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Bypass split-screen layout for specific routes (maintenance, login, etc.)
  const fullScreenRoutes = ["/maintenance", "/login", "/onboarding"];
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

  // --- DESKTOP LAYOUT ---
  return (
    <div className="flex bg-background h-screen overflow-hidden text-foreground font-lexend pl-20">
      {/* Sidebar */}
      <Navigation variant="sidebar" />

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header 
          onSignInClick={openSignInModal} 
          onSignOutClick={onSignOutClick} 
        />
        
        <main className="flex-1 overflow-y-auto flex flex-col p-2 pt-0">
            {children}
        </main>
      </div>

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
